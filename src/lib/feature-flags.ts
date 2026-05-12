/**
 * Step 4.6 — Feature Flag Infrastructure
 *
 * Simple environment-variable-backed feature flag system.
 * Enables per-module rollback during migration per migration-plan.md.
 *
 * Feature flags follow the pattern: FEATURE_<MODULE>_<FLAG>=true|false
 *
 * For MVP, flags are read from process.env. A database-backed system
 * can be added later for runtime toggling without redeploy.
 */

// ── Feature Flag Definitions ────────────────────────────────────────────────

/**
 * All known feature flags and their defaults.
 *
 * Convention: flags default to `true` for the happy path.
 * Set to `false` to disable / rollback a module.
 */
const FLAG_DEFAULTS = {
  /** Use API-backed data for Business Capability views (vs static fixtures). */
  FEATURE_CAPABILITIES_API: true,
  /** Use API-backed data for Application views. */
  FEATURE_APPLICATIONS_API: true,
  /** Use API-backed data for Strategy views. */
  FEATURE_STRATEGY_API: true,
  /** Use API-backed data for Technology Radar views. */
  FEATURE_RADAR_API: true,
  /** Use API-backed data for Roadmap views. */
  FEATURE_ROADMAP_API: true,
  /** Use API-backed data for Dashboard views. */
  FEATURE_DASHBOARD_API: true,
  /** Enable audit logging for mutation endpoints. */
  FEATURE_AUDIT_LOGGING: true,
  /** Enable RBAC permission checks on API routes. */
  FEATURE_RBAC_ENABLED: true,
} as const;

export type FeatureFlag = keyof typeof FLAG_DEFAULTS;

// ── Flag Resolution ─────────────────────────────────────────────────────────

/**
 * Check whether a feature flag is enabled.
 *
 * Resolution order:
 *   1. Environment variable (e.g. FEATURE_CAPABILITIES_API=false)
 *   2. Default value from FLAG_DEFAULTS
 *
 * Truthy values: "true", "1", "yes" (case-insensitive)
 * Falsy values: "false", "0", "no", "" (case-insensitive)
 *
 * @example
 * if (isFeatureEnabled("FEATURE_CAPABILITIES_API")) {
 *   // fetch from API
 * } else {
 *   // use static fixtures
 * }
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envValue = process.env[flag];

  if (envValue === undefined || envValue === "") {
    return FLAG_DEFAULTS[flag];
  }

  return ["true", "1", "yes"].includes(envValue.toLowerCase());
}

/**
 * Get all feature flags and their current resolved values.
 * Useful for admin/debug endpoints.
 */
export function getAllFlags(): Record<FeatureFlag, boolean> {
  const flags = {} as Record<FeatureFlag, boolean>;
  for (const key of Object.keys(FLAG_DEFAULTS) as FeatureFlag[]) {
    flags[key] = isFeatureEnabled(key);
  }
  return flags;
}

/**
 * Check if a data-source feature flag is enabled for a given module.
 * Convenience wrapper for the FEATURE_<MODULE>_API pattern.
 *
 * @param module - One of the six view modules
 * @returns true if the module should use API data, false for static fixtures
 */
export function isApiEnabled(
  module:
    | "capabilities"
    | "applications"
    | "strategy"
    | "radar"
    | "roadmap"
    | "dashboard"
): boolean {
  const flagMap: Record<string, FeatureFlag> = {
    capabilities: "FEATURE_CAPABILITIES_API",
    applications: "FEATURE_APPLICATIONS_API",
    strategy: "FEATURE_STRATEGY_API",
    radar: "FEATURE_RADAR_API",
    roadmap: "FEATURE_ROADMAP_API",
    dashboard: "FEATURE_DASHBOARD_API",
  };

  return isFeatureEnabled(flagMap[module]);
}
