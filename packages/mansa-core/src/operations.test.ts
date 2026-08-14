import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentLiquidityManager, ProviderRouter, ReconciliationEngine, RetryPlanner, RiskEngine } from './operations.js';

test('risk engine escalates suspicious behaviour', () => {
  const result = new RiskEngine().evaluate({ amount: 150_000n, newDevice: true, countryMismatch: true, transactionCountLastHour: 12, accountAgeHours: 4 });
  assert.equal(result.decision, 'BLOCK');
  assert.ok(result.score >= 70);
});

test('reconciliation detects amount and missing records', () => {
  const issues = new ReconciliationEngine().reconcile(
    [{ reference: 'r1', externalId: 'e1', amount: 100n, currency: 'XOF', status: 'SUCCEEDED' }, { reference: 'r2', amount: 50n, currency: 'XOF', status: 'PENDING' }],
    [{ externalId: 'e1', internalReference: 'r1', amount: 90n, currency: 'XOF', status: 'SUCCEEDED' }, { externalId: 'e3', amount: 20n, currency: 'XOF', status: 'SUCCEEDED' }],
  );
  assert.deepEqual(issues.map((issue) => issue.kind).sort(), ['AMOUNT_MISMATCH', 'MISSING_INTERNAL', 'MISSING_PROVIDER']);
});

test('retry planner applies capped exponential backoff', () => {
  const planner = new RetryPlanner({ maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 250 });
  assert.equal(planner.nextDelay(1), 100);
  assert.equal(planner.nextDelay(2), 200);
  assert.equal(planner.nextDelay(3), 250);
  assert.equal(planner.nextDelay(4), null);
});

test('agent liquidity guards cash and float', () => {
  const manager = new AgentLiquidityManager();
  manager.set({ agentId: 'a1', cashMinor: 1000n, electronicFloatMinor: 500n, minimumCashMinor: 1200n, minimumFloatMinor: 400n });
  manager.assertCanCashOut('a1', 700n);
  manager.assertCanCashIn('a1', 500n);
  assert.deepEqual(manager.alerts('a1'), ['LOW_CASH']);
  assert.throws(() => manager.assertCanCashOut('a1', 1200n));
});

test('provider router fails over to healthy provider by priority', () => {
  const router = new ProviderRouter([
    { id: 'primary', enabled: true, healthy: false, priority: 1, supportedOperations: ['CASH_IN'] },
    { id: 'backup', enabled: true, healthy: true, priority: 2, supportedOperations: ['CASH_IN'] },
  ]);
  assert.equal(router.select('CASH_IN').id, 'backup');
});
