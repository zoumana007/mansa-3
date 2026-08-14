import { createHash, randomUUID } from "node:crypto";

export type DeviceStatus = "TRUSTED" | "REVOKED";
export type SessionStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface DeviceFingerprintInput {
  userAgent: string;
  platform: string;
  locale: string;
  timezone: string;
  screen?: string;
}

export function fingerprintDevice(input: DeviceFingerprintInput): string {
  const canonical = [
    input.userAgent.trim().toLowerCase(),
    input.platform.trim().toLowerCase(),
    input.locale.trim().toLowerCase(),
    input.timezone.trim().toLowerCase(),
    input.screen?.trim().toLowerCase() ?? "",
  ].join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

export interface RegisteredDevice {
  id: string;
  userId: string;
  fingerprint: string;
  label: string;
  status: DeviceStatus;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface AccountSession {
  id: string;
  userId: string;
  deviceId: string;
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

export class DeviceSessionManager {
  private readonly devices = new Map<string, RegisteredDevice>();
  private readonly sessions = new Map<string, AccountSession>();

  registerDevice(userId: string, fingerprint: string, label: string, now = new Date()): RegisteredDevice {
    const existing = [...this.devices.values()].find(
      (device) => device.userId === userId && device.fingerprint === fingerprint && device.status === "TRUSTED",
    );
    if (existing) {
      existing.lastSeenAt = now;
      return { ...existing };
    }
    const device: RegisteredDevice = {
      id: randomUUID(),
      userId,
      fingerprint,
      label,
      status: "TRUSTED",
      createdAt: now,
      lastSeenAt: now,
    };
    this.devices.set(device.id, device);
    return { ...device };
  }

  createSession(userId: string, deviceId: string, ttlMs: number, now = new Date()): AccountSession {
    if (ttlMs <= 0) throw new Error("SESSION_TTL_INVALID");
    const device = this.devices.get(deviceId);
    if (!device || device.userId !== userId || device.status !== "TRUSTED") throw new Error("DEVICE_NOT_TRUSTED");
    const session: AccountSession = {
      id: randomUUID(),
      userId,
      deviceId,
      status: "ACTIVE",
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    };
    this.sessions.set(session.id, session);
    return { ...session };
  }

  validateSession(sessionId: string, now = new Date()): AccountSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");
    if (session.status !== "ACTIVE") throw new Error("SESSION_NOT_ACTIVE");
    if (session.expiresAt.getTime() <= now.getTime()) {
      session.status = "EXPIRED";
      throw new Error("SESSION_EXPIRED");
    }
    const device = this.devices.get(session.deviceId);
    if (!device || device.status !== "TRUSTED") throw new Error("DEVICE_NOT_TRUSTED");
    return { ...session };
  }

  revokeSession(sessionId: string, now = new Date()): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");
    session.status = "REVOKED";
    session.revokedAt = now;
  }

  revokeDevice(deviceId: string, now = new Date()): void {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error("DEVICE_NOT_FOUND");
    device.status = "REVOKED";
    for (const session of this.sessions.values()) {
      if (session.deviceId === deviceId && session.status === "ACTIVE") {
        session.status = "REVOKED";
        session.revokedAt = now;
      }
    }
  }

  listUserDevices(userId: string): RegisteredDevice[] {
    return [...this.devices.values()].filter((device) => device.userId === userId).map((device) => ({ ...device }));
  }
}

export type RecoveryStatus = "PENDING" | "VERIFIED" | "LOCKED" | "EXPIRED" | "CONSUMED";

export interface RecoveryChallenge {
  id: string;
  userId: string;
  secretHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  status: RecoveryStatus;
  verifiedAt?: Date;
  consumedAt?: Date;
}

export class AccountRecoveryManager {
  private readonly challenges = new Map<string, RecoveryChallenge>();

  createChallenge(userId: string, secret: string, ttlMs: number, maxAttempts = 5, now = new Date()): RecoveryChallenge {
    if (ttlMs <= 0 || maxAttempts <= 0 || !secret) throw new Error("RECOVERY_CONFIGURATION_INVALID");
    const challenge: RecoveryChallenge = {
      id: randomUUID(),
      userId,
      secretHash: createHash("sha256").update(secret).digest("hex"),
      attempts: 0,
      maxAttempts,
      expiresAt: new Date(now.getTime() + ttlMs),
      status: "PENDING",
    };
    this.challenges.set(challenge.id, challenge);
    return { ...challenge };
  }

  verify(challengeId: string, secret: string, now = new Date()): RecoveryChallenge {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) throw new Error("RECOVERY_NOT_FOUND");
    if (challenge.status !== "PENDING") throw new Error("RECOVERY_NOT_PENDING");
    if (challenge.expiresAt.getTime() <= now.getTime()) {
      challenge.status = "EXPIRED";
      throw new Error("RECOVERY_EXPIRED");
    }
    challenge.attempts += 1;
    const candidate = createHash("sha256").update(secret).digest("hex");
    if (candidate !== challenge.secretHash) {
      if (challenge.attempts >= challenge.maxAttempts) challenge.status = "LOCKED";
      throw new Error("RECOVERY_SECRET_INVALID");
    }
    challenge.status = "VERIFIED";
    challenge.verifiedAt = now;
    return { ...challenge };
  }

  consume(challengeId: string, now = new Date()): RecoveryChallenge {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) throw new Error("RECOVERY_NOT_FOUND");
    if (challenge.status !== "VERIFIED") throw new Error("RECOVERY_NOT_VERIFIED");
    challenge.status = "CONSUMED";
    challenge.consumedAt = now;
    return { ...challenge };
  }
}

export type ConsentStatus = "GRANTED" | "REVOKED";
export interface ConsentRecord {
  userId: string;
  purpose: string;
  policyVersion: string;
  status: ConsentStatus;
  recordedAt: Date;
}

export class ConsentRegistry {
  private readonly records: ConsentRecord[] = [];

  record(userId: string, purpose: string, policyVersion: string, status: ConsentStatus, now = new Date()): ConsentRecord {
    if (!purpose || !policyVersion) throw new Error("CONSENT_METADATA_REQUIRED");
    const record: ConsentRecord = { userId, purpose, policyVersion, status, recordedAt: now };
    this.records.push(record);
    return { ...record };
  }

  hasActiveConsent(userId: string, purpose: string, policyVersion: string): boolean {
    const latest = [...this.records]
      .reverse()
      .find((record) => record.userId === userId && record.purpose === purpose && record.policyVersion === policyVersion);
    return latest?.status === "GRANTED";
  }

  history(userId: string): ConsentRecord[] {
    return this.records.filter((record) => record.userId === userId).map((record) => ({ ...record }));
  }
}

export interface RetentionRule {
  dataType: string;
  retainForDays: number;
  legalHold?: boolean;
}

export class DataGovernanceService {
  constructor(private readonly rules: RetentionRule[]) {}

  deletionEligible(dataType: string, createdAt: Date, now = new Date()): boolean {
    const rule = this.rules.find((candidate) => candidate.dataType === dataType);
    if (!rule) throw new Error("RETENTION_RULE_NOT_FOUND");
    if (rule.legalHold) return false;
    const expiresAt = createdAt.getTime() + rule.retainForDays * 86_400_000;
    return expiresAt <= now.getTime();
  }

  buildUserExport<T extends Record<string, unknown>>(userId: string, datasets: T[]): { userId: string; exportedAt: Date; datasets: T[] } {
    return { userId, exportedAt: new Date(), datasets: structuredClone(datasets) };
  }
}

export type Permission =
  | "USER_READ"
  | "KYC_REVIEW"
  | "TRANSACTION_READ"
  | "TRANSACTION_ADJUST"
  | "REFUND_APPROVE"
  | "RISK_MANAGE"
  | "AUDIT_READ"
  | "ROLE_MANAGE";

export class RbacPolicy {
  constructor(private readonly rolePermissions: Record<string, readonly Permission[]>) {}

  can(role: string, permission: Permission): boolean {
    return this.rolePermissions[role]?.includes(permission) ?? false;
  }

  assert(role: string, permission: Permission): void {
    if (!this.can(role, permission)) throw new Error("PERMISSION_DENIED");
  }
}

export interface AuditEntry {
  sequence: number;
  actorId: string;
  action: string;
  target: string;
  occurredAt: Date;
  previousHash: string;
  hash: string;
}

export class ImmutableAuditLog {
  private readonly entries: AuditEntry[] = [];

  append(actorId: string, action: string, target: string, now = new Date()): AuditEntry {
    const sequence = this.entries.length + 1;
    const previousHash = this.entries.at(-1)?.hash ?? "GENESIS";
    const payload = `${sequence}|${actorId}|${action}|${target}|${now.toISOString()}|${previousHash}`;
    const entry: AuditEntry = {
      sequence,
      actorId,
      action,
      target,
      occurredAt: now,
      previousHash,
      hash: createHash("sha256").update(payload).digest("hex"),
    };
    this.entries.push(entry);
    return { ...entry };
  }

  list(): AuditEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  verify(): boolean {
    let previousHash = "GENESIS";
    for (const entry of this.entries) {
      const payload = `${entry.sequence}|${entry.actorId}|${entry.action}|${entry.target}|${entry.occurredAt.toISOString()}|${previousHash}`;
      const expected = createHash("sha256").update(payload).digest("hex");
      if (entry.previousHash !== previousHash || entry.hash !== expected) return false;
      previousHash = entry.hash;
    }
    return true;
  }
}
