import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFeatureEnabled, getAllFlags, isApiEnabled, type FeatureFlag } from "@/lib/feature-flags";

// ── Helpers ──────────────────────────────────────────────────────────────────

function withEnv(key: string, value: string | undefined, fn: () => void) {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

// ── Default values ───────────────────────────────────────────────────────────

describe("feature-flags — defaults", () => {
  const allFlagsDefault: FeatureFlag[] = [
    "FEATURE_CAPABILITIES_API",
    "FEATURE_APPLICATIONS_API",
    "FEATURE_STRATEGY_API",
    "FEATURE_RADAR_API",
    "FEATURE_ROADMAP_API",
    "FEATURE_DASHBOARD_API",
    "FEATURE_AUDIT_LOGGING",
    "FEATURE_RBAC_ENABLED",
  ];

  it.each(allFlagsDefault)("%s defaults to true", (flag) => {
    withEnv(flag, undefined, () => {
      expect(isFeatureEnabled(flag)).toBe(true);
    });
  });
});

// ── Env overrides — falsy values ─────────────────────────────────────────────

describe("feature-flags — falsy env overrides", () => {
  it.each(["false", "0", "no", "FALSE", "NO", "False"])(
    'treats "%s" as disabled',
    (value) => {
      withEnv("FEATURE_CAPABILITIES_API", value, () => {
        expect(isFeatureEnabled("FEATURE_CAPABILITIES_API")).toBe(false);
      });
    }
  );

  it("treats empty string as default (true)", () => {
    withEnv("FEATURE_CAPABILITIES_API", "", () => {
      // Empty string falls through to default
      expect(isFeatureEnabled("FEATURE_CAPABILITIES_API")).toBe(true);
    });
  });
});

// ── Env overrides — truthy values ────────────────────────────────────────────

describe("feature-flags — truthy env overrides", () => {
  it.each(["true", "1", "yes", "TRUE", "YES", "True"])(
    'treats "%s" as enabled',
    (value) => {
      // First disable it, then re-enable via env
      withEnv("FEATURE_RBAC_ENABLED", "false", () => {
        withEnv("FEATURE_RBAC_ENABLED", value, () => {
          expect(isFeatureEnabled("FEATURE_RBAC_ENABLED")).toBe(true);
        });
      });
    }
  );
});

// ── getAllFlags() ────────────────────────────────────────────────────────────

describe("feature-flags — getAllFlags()", () => {
  it("returns an object with all known flag keys", () => {
    const flags = getAllFlags();
    const keys = Object.keys(flags);
    expect(keys).toContain("FEATURE_CAPABILITIES_API");
    expect(keys).toContain("FEATURE_APPLICATIONS_API");
    expect(keys).toContain("FEATURE_STRATEGY_API");
    expect(keys).toContain("FEATURE_RADAR_API");
    expect(keys).toContain("FEATURE_ROADMAP_API");
    expect(keys).toContain("FEATURE_DASHBOARD_API");
    expect(keys).toContain("FEATURE_AUDIT_LOGGING");
    expect(keys).toContain("FEATURE_RBAC_ENABLED");
  });

  it("all values are booleans", () => {
    const flags = getAllFlags();
    for (const value of Object.values(flags)) {
      expect(typeof value).toBe("boolean");
    }
  });

  it("reflects env overrides", () => {
    withEnv("FEATURE_AUDIT_LOGGING", "false", () => {
      const flags = getAllFlags();
      expect(flags.FEATURE_AUDIT_LOGGING).toBe(false);
    });
  });
});

// ── isApiEnabled() ───────────────────────────────────────────────────────────

describe("feature-flags — isApiEnabled()", () => {
  const modules = [
    "capabilities",
    "applications",
    "strategy",
    "radar",
    "roadmap",
    "dashboard",
  ] as const;

  it.each(modules)('"%s" module defaults to enabled', (mod) => {
    expect(isApiEnabled(mod)).toBe(true);
  });

  it("returns false when the corresponding flag is disabled", () => {
    withEnv("FEATURE_CAPABILITIES_API", "false", () => {
      expect(isApiEnabled("capabilities")).toBe(false);
    });
  });

  it("returns true when the flag is explicitly enabled", () => {
    withEnv("FEATURE_RADAR_API", "true", () => {
      expect(isApiEnabled("radar")).toBe(true);
    });
  });
});
