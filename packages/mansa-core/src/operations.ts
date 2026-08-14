export type RiskDecision = 'ALLOW' | 'REVIEW' | 'BLOCK';

export interface RiskSignal { code: string; score: number; reason: string; }
export interface RiskInput {
  amount: bigint;
  transactionCountLastHour?: number;
  newDevice?: boolean;
  countryMismatch?: boolean;
  accountAgeHours?: number;
  cashOutAfterCashInMinutes?: number;
}

export class RiskEngine {
  evaluate(input: RiskInput): { decision: RiskDecision; score: number; signals: readonly RiskSignal[] } {
    const signals: RiskSignal[] = [];
    const add = (code: string, score: number, reason: string) => signals.push({ code, score, reason });
    if (input.newDevice) add('NEW_DEVICE', 15, 'transaction initiated from a new device');
    if (input.countryMismatch) add('COUNTRY_MISMATCH', 30, 'device country differs from account country');
    if ((input.transactionCountLastHour ?? 0) >= 10) add('HIGH_VELOCITY', 25, 'high transaction velocity');
    if ((input.accountAgeHours ?? Number.MAX_SAFE_INTEGER) < 24 && input.amount >= 100_000n) add('NEW_ACCOUNT_HIGH_VALUE', 25, 'high-value transaction on a new account');
    if ((input.cashOutAfterCashInMinutes ?? Number.MAX_SAFE_INTEGER) <= 10) add('RAPID_CASH_OUT', 35, 'cash-out shortly after cash-in');
    const score = signals.reduce((total, signal) => total + signal.score, 0);
    return { decision: score >= 70 ? 'BLOCK' : score >= 35 ? 'REVIEW' : 'ALLOW', score, signals };
  }
}

export interface ProviderRecord {
  externalId: string;
  internalReference?: string;
  amount: bigint;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
}
export interface InternalRecord {
  reference: string;
  externalId?: string;
  amount: bigint;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
}
export type ReconciliationIssue =
  | { kind: 'MISSING_INTERNAL'; provider: ProviderRecord }
  | { kind: 'MISSING_PROVIDER'; internal: InternalRecord }
  | { kind: 'AMOUNT_MISMATCH'; internal: InternalRecord; provider: ProviderRecord }
  | { kind: 'STATUS_MISMATCH'; internal: InternalRecord; provider: ProviderRecord };

export class ReconciliationEngine {
  reconcile(internal: readonly InternalRecord[], provider: readonly ProviderRecord[]): readonly ReconciliationIssue[] {
    const issues: ReconciliationIssue[] = [];
    const byExternalId = new Map(provider.map((record) => [record.externalId, record]));
    const matched = new Set<string>();
    for (const local of internal) {
      const remote = local.externalId ? byExternalId.get(local.externalId) : provider.find((r) => r.internalReference === local.reference);
      if (!remote) { issues.push({ kind: 'MISSING_PROVIDER', internal: local }); continue; }
      matched.add(remote.externalId);
      if (remote.currency.toUpperCase() !== local.currency.toUpperCase() || remote.amount !== local.amount) issues.push({ kind: 'AMOUNT_MISMATCH', internal: local, provider: remote });
      else if (remote.status !== local.status) issues.push({ kind: 'STATUS_MISMATCH', internal: local, provider: remote });
    }
    for (const remote of provider) if (!matched.has(remote.externalId)) issues.push({ kind: 'MISSING_INTERNAL', provider: remote });
    return issues;
  }
}

export interface RetryPolicy { maxAttempts: number; baseDelayMs: number; maxDelayMs: number; }
export class RetryPlanner {
  constructor(private readonly policy: RetryPolicy) {
    if (policy.maxAttempts < 1 || policy.baseDelayMs < 0 || policy.maxDelayMs < policy.baseDelayMs) throw new Error('invalid retry policy');
  }
  nextDelay(attempt: number): number | null {
    if (attempt < 1) throw new Error('attempt must be >= 1');
    if (attempt >= this.policy.maxAttempts) return null;
    return Math.min(this.policy.baseDelayMs * 2 ** (attempt - 1), this.policy.maxDelayMs);
  }
}

export interface AgentLiquidity {
  agentId: string;
  cashMinor: bigint;
  electronicFloatMinor: bigint;
  minimumCashMinor?: bigint;
  minimumFloatMinor?: bigint;
}
export class AgentLiquidityManager {
  constructor(private readonly positions = new Map<string, AgentLiquidity>()) {}
  set(position: AgentLiquidity): void {
    if (position.cashMinor < 0n || position.electronicFloatMinor < 0n) throw new Error('liquidity cannot be negative');
    this.positions.set(position.agentId, { ...position });
  }
  get(agentId: string): AgentLiquidity {
    const value = this.positions.get(agentId);
    if (!value) throw new Error(`unknown agent ${agentId}`);
    return { ...value };
  }
  assertCanCashOut(agentId: string, amount: bigint): void {
    const position = this.get(agentId);
    if (amount <= 0n) throw new Error('amount must be positive');
    if (position.cashMinor < amount) throw new Error('insufficient agent cash');
  }
  assertCanCashIn(agentId: string, amount: bigint): void {
    const position = this.get(agentId);
    if (amount <= 0n) throw new Error('amount must be positive');
    if (position.electronicFloatMinor < amount) throw new Error('insufficient agent electronic float');
  }
  alerts(agentId: string): readonly string[] {
    const position = this.get(agentId);
    const alerts: string[] = [];
    if (position.minimumCashMinor !== undefined && position.cashMinor < position.minimumCashMinor) alerts.push('LOW_CASH');
    if (position.minimumFloatMinor !== undefined && position.electronicFloatMinor < position.minimumFloatMinor) alerts.push('LOW_FLOAT');
    return alerts;
  }
}

export interface ProviderHealth {
  id: string;
  enabled: boolean;
  priority: number;
  healthy: boolean;
  supportedOperations: readonly string[];
}
export class ProviderRouter {
  constructor(private readonly providers: readonly ProviderHealth[]) {}
  select(operation: string, excluded: readonly string[] = []): ProviderHealth {
    const provider = [...this.providers]
      .filter((p) => p.enabled && p.healthy && p.supportedOperations.includes(operation) && !excluded.includes(p.id))
      .sort((a, b) => a.priority - b.priority)[0];
    if (!provider) throw new Error(`no healthy provider for ${operation}`);
    return provider;
  }
}
