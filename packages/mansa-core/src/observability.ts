export type MetricKind = 'COUNTER' | 'GAUGE' | 'HISTOGRAM';

export interface MetricPoint {
  name: string;
  kind: MetricKind;
  value: number;
  timestamp: Date;
  labels: Readonly<Record<string, string>>;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  name: string;
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  status: 'OK' | 'ERROR';
  attributes: Readonly<Record<string, string>>;
}

export class ObservabilityRegistry {
  private readonly metrics: MetricPoint[] = [];
  private readonly spans = new Map<string, TraceSpan>();

  recordMetric(input: Omit<MetricPoint, 'timestamp' | 'labels'> & { timestamp?: Date; labels?: Record<string, string> }): MetricPoint {
    if (!input.name.trim()) throw new Error('metric name is required');
    if (!Number.isFinite(input.value)) throw new Error('metric value must be finite');
    const point: MetricPoint = Object.freeze({
      name: input.name,
      kind: input.kind,
      value: input.value,
      timestamp: input.timestamp ?? new Date(),
      labels: Object.freeze({ ...(input.labels ?? {}) }),
    });
    this.metrics.push(point);
    return point;
  }

  increment(name: string, labels?: Record<string, string>, amount = 1, timestamp?: Date): MetricPoint {
    if (amount < 0) throw new Error('counter increment must be non-negative');
    return this.recordMetric({ name, kind: 'COUNTER', value: amount, labels, timestamp });
  }

  listMetrics(name?: string): readonly MetricPoint[] {
    return this.metrics.filter((metric) => !name || metric.name === name).map((metric) => ({ ...metric, labels: { ...metric.labels } }));
  }

  startSpan(input: {
    traceId: string;
    spanId: string;
    name: string;
    startedAt?: Date;
    attributes?: Record<string, string>;
  }): TraceSpan {
    if (this.spans.has(input.spanId)) throw new Error(`span ${input.spanId} already exists`);
    const span: TraceSpan = Object.freeze({
      traceId: input.traceId,
      spanId: input.spanId,
      name: input.name,
      startedAt: input.startedAt ?? new Date(),
      status: 'OK',
      attributes: Object.freeze({ ...(input.attributes ?? {}) }),
    });
    this.spans.set(input.spanId, span);
    return span;
  }

  endSpan(spanId: string, input?: { endedAt?: Date; status?: 'OK' | 'ERROR'; attributes?: Record<string, string> }): TraceSpan {
    const existing = this.spans.get(spanId);
    if (!existing) throw new Error(`unknown span ${spanId}`);
    if (existing.endedAt) throw new Error(`span ${spanId} already ended`);
    const endedAt = input?.endedAt ?? new Date();
    const durationMs = endedAt.getTime() - existing.startedAt.getTime();
    if (durationMs < 0) throw new Error('span end cannot precede start');
    const span: TraceSpan = Object.freeze({
      ...existing,
      endedAt,
      durationMs,
      status: input?.status ?? existing.status,
      attributes: Object.freeze({ ...existing.attributes, ...(input?.attributes ?? {}) }),
    });
    this.spans.set(spanId, span);
    return span;
  }

  getSpan(spanId: string): TraceSpan | undefined {
    const span = this.spans.get(spanId);
    return span ? { ...span, attributes: { ...span.attributes } } : undefined;
  }
}

export type AlertOperator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertRule {
  id: string;
  metricName: string;
  operator: AlertOperator;
  threshold: number;
  severity: IncidentSeverity;
  cooldownMs: number;
  enabled: boolean;
  requiredLabels?: Readonly<Record<string, string>>;
}

export interface IncidentAlert {
  id: string;
  ruleId: string;
  metricName: string;
  observedValue: number;
  threshold: number;
  severity: IncidentSeverity;
  openedAt: Date;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  labels: Readonly<Record<string, string>>;
}

function matches(operator: AlertOperator, value: number, threshold: number): boolean {
  switch (operator) {
    case 'GT': return value > threshold;
    case 'GTE': return value >= threshold;
    case 'LT': return value < threshold;
    case 'LTE': return value <= threshold;
    case 'EQ': return value === threshold;
  }
}

export class IncidentAlertManager {
  private readonly rules = new Map<string, AlertRule>();
  private readonly alerts = new Map<string, IncidentAlert>();
  private readonly lastTriggeredAt = new Map<string, number>();
  private sequence = 0;

  registerRule(rule: AlertRule): void {
    if (this.rules.has(rule.id)) throw new Error(`alert rule ${rule.id} already exists`);
    if (!Number.isFinite(rule.threshold)) throw new Error('alert threshold must be finite');
    if (rule.cooldownMs < 0) throw new Error('cooldown must be non-negative');
    this.rules.set(rule.id, { ...rule, requiredLabels: rule.requiredLabels ? { ...rule.requiredLabels } : undefined });
  }

  evaluate(metric: MetricPoint, now: Date = metric.timestamp): readonly IncidentAlert[] {
    const triggered: IncidentAlert[] = [];
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.metricName !== metric.name) continue;
      if (rule.requiredLabels && !Object.entries(rule.requiredLabels).every(([key, value]) => metric.labels[key] === value)) continue;
      if (!matches(rule.operator, metric.value, rule.threshold)) continue;
      const previous = this.lastTriggeredAt.get(rule.id);
      if (previous !== undefined && now.getTime() - previous < rule.cooldownMs) continue;

      const alert: IncidentAlert = Object.freeze({
        id: `incident-${++this.sequence}`,
        ruleId: rule.id,
        metricName: metric.name,
        observedValue: metric.value,
        threshold: rule.threshold,
        severity: rule.severity,
        openedAt: now,
        status: 'OPEN',
        labels: Object.freeze({ ...metric.labels }),
      });
      this.alerts.set(alert.id, alert);
      this.lastTriggeredAt.set(rule.id, now.getTime());
      triggered.push(alert);
    }
    return triggered;
  }

  acknowledge(alertId: string): IncidentAlert {
    return this.transition(alertId, 'ACKNOWLEDGED');
  }

  resolve(alertId: string): IncidentAlert {
    return this.transition(alertId, 'RESOLVED');
  }

  list(status?: IncidentAlert['status']): readonly IncidentAlert[] {
    return [...this.alerts.values()].filter((alert) => !status || alert.status === status).map((alert) => ({ ...alert, labels: { ...alert.labels } }));
  }

  private transition(alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED'): IncidentAlert {
    const current = this.alerts.get(alertId);
    if (!current) throw new Error(`unknown incident ${alertId}`);
    if (current.status === 'RESOLVED') throw new Error('resolved incident cannot transition');
    if (current.status === status) return current;
    const next: IncidentAlert = Object.freeze({ ...current, status });
    this.alerts.set(alertId, next);
    return next;
  }
}
