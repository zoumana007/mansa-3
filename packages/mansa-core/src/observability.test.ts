import test from 'node:test';
import assert from 'node:assert/strict';
import { IncidentAlertManager, ObservabilityRegistry } from './observability.js';

test('records metrics and traces with deterministic duration', () => {
  const registry = new ObservabilityRegistry();
  const at = new Date('2026-08-14T18:00:00.000Z');
  const metric = registry.recordMetric({ name: 'payment.success_rate', kind: 'GAUGE', value: 98.5, timestamp: at, labels: { provider: 'mock' } });
  assert.equal(metric.value, 98.5);
  assert.equal(registry.listMetrics('payment.success_rate').length, 1);

  registry.startSpan({ traceId: 'trace-1', spanId: 'span-1', name: 'payment.authorize', startedAt: at });
  const ended = registry.endSpan('span-1', { endedAt: new Date(at.getTime() + 250), status: 'OK' });
  assert.equal(ended.durationMs, 250);
  assert.equal(ended.status, 'OK');
});

test('rejects invalid metric values and negative counter increments', () => {
  const registry = new ObservabilityRegistry();
  assert.throws(() => registry.recordMetric({ name: 'latency', kind: 'GAUGE', value: Number.NaN }), /finite/);
  assert.throws(() => registry.increment('requests', {}, -1), /non-negative/);
});

test('triggers incidents with labels and respects cooldown', () => {
  const manager = new IncidentAlertManager();
  manager.registerRule({ id: 'provider-failures', metricName: 'provider.error_rate', operator: 'GTE', threshold: 5, severity: 'CRITICAL', cooldownMs: 60_000, enabled: true, requiredLabels: { provider: 'orange-money' } });
  const base = new Date('2026-08-14T18:00:00.000Z');
  const metric = { name: 'provider.error_rate', kind: 'GAUGE' as const, value: 7, timestamp: base, labels: { provider: 'orange-money' } };
  const first = manager.evaluate(metric, base);
  assert.equal(first.length, 1);
  assert.equal(first[0]?.severity, 'CRITICAL');
  assert.equal(manager.evaluate(metric, new Date(base.getTime() + 30_000)).length, 0);
  assert.equal(manager.evaluate(metric, new Date(base.getTime() + 61_000)).length, 1);
});

test('supports incident acknowledgement and resolution', () => {
  const manager = new IncidentAlertManager();
  manager.registerRule({ id: 'latency', metricName: 'api.latency_ms', operator: 'GT', threshold: 1000, severity: 'WARNING', cooldownMs: 0, enabled: true });
  const metric = { name: 'api.latency_ms', kind: 'HISTOGRAM' as const, value: 1500, timestamp: new Date(), labels: {} };
  const alert = manager.evaluate(metric)[0];
  assert.ok(alert);
  assert.equal(manager.acknowledge(alert.id).status, 'ACKNOWLEDGED');
  assert.equal(manager.resolve(alert.id).status, 'RESOLVED');
  assert.equal(manager.list('RESOLVED').length, 1);
});
