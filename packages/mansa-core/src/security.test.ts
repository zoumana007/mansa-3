import test from "node:test";
import assert from "node:assert/strict";
import {
  AccountRecoveryManager,
  ConsentRegistry,
  DataGovernanceService,
  DeviceSessionManager,
  ImmutableAuditLog,
  RbacPolicy,
  fingerprintDevice,
} from "./security.js";

test("fingerprinting is deterministic and sessions are revoked with the device", () => {
  const fingerprint = fingerprintDevice({
    userAgent: "MANSA/1.0",
    platform: "Android",
    locale: "fr-ML",
    timezone: "Africa/Bamako",
  });
  assert.equal(fingerprint.length, 64);

  const manager = new DeviceSessionManager();
  const now = new Date("2026-08-14T18:00:00Z");
  const device = manager.registerDevice("user-1", fingerprint, "Téléphone principal", now);
  const session = manager.createSession("user-1", device.id, 60_000, now);
  assert.equal(manager.validateSession(session.id, new Date(now.getTime() + 1_000)).status, "ACTIVE");
  manager.revokeDevice(device.id, new Date(now.getTime() + 2_000));
  assert.throws(() => manager.validateSession(session.id, new Date(now.getTime() + 3_000)), /SESSION_NOT_ACTIVE/);
});

test("recovery challenges lock after repeated failures and verified challenges are single use", () => {
  const manager = new AccountRecoveryManager();
  const now = new Date("2026-08-14T18:00:00Z");
  const locked = manager.createChallenge("user-1", "123456", 60_000, 2, now);
  assert.throws(() => manager.verify(locked.id, "000000", now), /RECOVERY_SECRET_INVALID/);
  assert.throws(() => manager.verify(locked.id, "111111", now), /RECOVERY_SECRET_INVALID/);
  assert.throws(() => manager.verify(locked.id, "123456", now), /RECOVERY_NOT_PENDING/);

  const valid = manager.createChallenge("user-1", "654321", 60_000, 3, now);
  assert.equal(manager.verify(valid.id, "654321", now).status, "VERIFIED");
  assert.equal(manager.consume(valid.id, now).status, "CONSUMED");
  assert.throws(() => manager.consume(valid.id, now), /RECOVERY_NOT_VERIFIED/);
});

test("consent is versioned and can be revoked", () => {
  const registry = new ConsentRegistry();
  registry.record("user-1", "marketing", "v1", "GRANTED");
  assert.equal(registry.hasActiveConsent("user-1", "marketing", "v1"), true);
  registry.record("user-1", "marketing", "v1", "REVOKED");
  assert.equal(registry.hasActiveConsent("user-1", "marketing", "v1"), false);
  assert.equal(registry.hasActiveConsent("user-1", "marketing", "v2"), false);
});

test("retention rules respect legal holds and export data defensively", () => {
  const governance = new DataGovernanceService([
    { dataType: "support-message", retainForDays: 30 },
    { dataType: "transaction", retainForDays: 3650, legalHold: true },
  ]);
  const now = new Date("2026-08-14T18:00:00Z");
  assert.equal(governance.deletionEligible("support-message", new Date("2026-06-01T00:00:00Z"), now), true);
  assert.equal(governance.deletionEligible("transaction", new Date("2010-01-01T00:00:00Z"), now), false);
  const source = [{ type: "profile", value: "Z" }];
  const exported = governance.buildUserExport("user-1", source);
  source[0]!.value = "changed";
  assert.equal(exported.datasets[0]!.value, "Z");
});

test("RBAC denies missing permissions", () => {
  const rbac = new RbacPolicy({
    support: ["USER_READ", "TRANSACTION_READ"],
    risk: ["USER_READ", "TRANSACTION_READ", "RISK_MANAGE"],
  });
  assert.equal(rbac.can("risk", "RISK_MANAGE"), true);
  assert.equal(rbac.can("support", "RISK_MANAGE"), false);
  assert.throws(() => rbac.assert("support", "REFUND_APPROVE"), /PERMISSION_DENIED/);
});

test("immutable audit log forms and verifies a hash chain", () => {
  const log = new ImmutableAuditLog();
  const first = log.append("admin-1", "ACCOUNT_FREEZE", "user-1", new Date("2026-08-14T18:00:00Z"));
  const second = log.append("admin-2", "ACCOUNT_UNFREEZE", "user-1", new Date("2026-08-14T18:01:00Z"));
  assert.equal(first.previousHash, "GENESIS");
  assert.equal(second.previousHash, first.hash);
  assert.equal(log.verify(), true);
});
