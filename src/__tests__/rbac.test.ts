import { describe, it, expect } from "vitest";
import { checkPermission, methodToOperation, type Operation } from "@/lib/rbac";
import type { AuthContext } from "@/lib/auth";

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeAuth(role: AuthContext["role"]): AuthContext {
  return {
    userId: "user-1",
    email: "test@example.com",
    name: "Test User",
    role,
    workspaceId: "ws-1",
  };
}

const ALL_OPERATIONS: Operation[] = [
  "view",
  "create",
  "edit",
  "delete",
  "manage_users",
  "manage_workspace",
  "view_audit",
];

// ── Permission matrix tests ──────────────────────────────────────────────────

describe("rbac — Viewer role", () => {
  const auth = makeAuth("Viewer");

  it("can view", () => {
    expect(checkPermission(auth, "view").ok).toBe(true);
  });

  it.each(["create", "edit", "delete", "manage_users", "manage_workspace", "view_audit"] as const)(
    "cannot %s",
    (op) => {
      const result = checkPermission(auth, op);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(403);
      }
    }
  );
});

describe("rbac — Member role", () => {
  const auth = makeAuth("Member");

  it.each(["view", "create", "edit"] as const)("can %s", (op) => {
    expect(checkPermission(auth, op).ok).toBe(true);
  });

  it.each(["delete", "manage_users", "manage_workspace", "view_audit"] as const)(
    "cannot %s",
    (op) => {
      const result = checkPermission(auth, op);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(403);
      }
    }
  );
});

describe("rbac — Admin role", () => {
  const auth = makeAuth("Admin");

  it.each(ALL_OPERATIONS)("can %s", (op) => {
    expect(checkPermission(auth, op).ok).toBe(true);
  });
});

describe("rbac — forbidden response body", () => {
  it("includes the role and operation in the message", async () => {
    const auth = makeAuth("Viewer");
    const result = checkPermission(auth, "delete");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const body = await result.response.json();
      expect(body.error.code).toBe("FORBIDDEN");
      expect(body.error.message).toContain("Viewer");
      expect(body.error.message).toContain("delete");
    }
  });
});

// ── methodToOperation tests ──────────────────────────────────────────────────

describe("rbac — methodToOperation()", () => {
  it.each([
    ["GET", "view"],
    ["HEAD", "view"],
    ["OPTIONS", "view"],
    ["POST", "create"],
    ["PUT", "edit"],
    ["PATCH", "edit"],
    ["DELETE", "delete"],
  ] as const)("maps %s → %s", (method, expected) => {
    expect(methodToOperation(method)).toBe(expected);
  });

  it("falls back to view for unknown methods", () => {
    expect(methodToOperation("UNKNOWN")).toBe("view");
  });

  it("is case-insensitive", () => {
    expect(methodToOperation("get")).toBe("view");
    expect(methodToOperation("post")).toBe("create");
    expect(methodToOperation("delete")).toBe("delete");
  });
});
