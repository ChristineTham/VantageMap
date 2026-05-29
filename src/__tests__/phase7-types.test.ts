/**
 * Phase 7 — types.ts tests
 *
 * Verifies that all colour map objects are complete and well-formed,
 * and that type unions are correctly defined.
 */

import { describe, it, expect } from "vitest";
import {
  healthColour,
  healthBg,
  lifecycleColour,
  techRingColour,
  initiativeStatusColour,
  type HealthStatus,
  type LifecyclePhase,
  type TechRing,
  type InitiativeStatus,
} from "@/lib/types";

// ── Sentinel arrays (derived from the union types) ──────────────────────────

const HEALTH_STATUSES: HealthStatus[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];
const LIFECYCLE_PHASES: LifecyclePhase[] = [
  "Plan",
  "Phase In",
  "Active",
  "Phase Out",
  "End of Life",
];
const TECH_RINGS: TechRing[] = ["Adopt", "Trial", "Assess", "Hold"];
const INITIATIVE_STATUSES: InitiativeStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

// ── healthColour ─────────────────────────────────────────────────────────────

describe("healthColour", () => {
  it("has an entry for every HealthStatus", () => {
    for (const status of HEALTH_STATUSES) {
      expect(healthColour).toHaveProperty(status);
    }
  });

  it("has no extra keys beyond the HealthStatus values", () => {
    expect(Object.keys(healthColour)).toHaveLength(HEALTH_STATUSES.length);
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(healthColour)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("each value starts with 'text-' (text colour class)", () => {
    for (const value of Object.values(healthColour)) {
      expect(value).toMatch(/^text-/);
    }
  });
});

// ── healthBg ─────────────────────────────────────────────────────────────────

describe("healthBg", () => {
  it("has an entry for every HealthStatus", () => {
    for (const status of HEALTH_STATUSES) {
      expect(healthBg).toHaveProperty(status);
    }
  });

  it("has no extra keys beyond the HealthStatus values", () => {
    expect(Object.keys(healthBg)).toHaveLength(HEALTH_STATUSES.length);
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(healthBg)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("each value contains a background and text class", () => {
    for (const value of Object.values(healthBg)) {
      expect(value).toMatch(/bg-/);
      expect(value).toMatch(/text-/);
    }
  });

  it("Excellent and Good share the same badge style", () => {
    expect(healthBg["Excellent"]).toBe(healthBg["Good"]);
  });
});

// ── lifecycleColour ──────────────────────────────────────────────────────────

describe("lifecycleColour", () => {
  it("has an entry for every LifecyclePhase", () => {
    for (const phase of LIFECYCLE_PHASES) {
      expect(lifecycleColour).toHaveProperty(phase);
    }
  });

  it("has no extra keys beyond the LifecyclePhase values", () => {
    expect(Object.keys(lifecycleColour)).toHaveLength(LIFECYCLE_PHASES.length);
  });

  it("all values are non-empty strings containing both bg- and text-", () => {
    for (const value of Object.values(lifecycleColour)) {
      expect(value).toMatch(/bg-/);
      expect(value).toMatch(/text-/);
    }
  });

  it("Active phase uses teal colour (good signal)", () => {
    expect(lifecycleColour["Active"]).toContain("teal");
  });

  it("End of Life phase uses rose colour (danger signal)", () => {
    expect(lifecycleColour["End of Life"]).toContain("rose");
  });
});

// ── techRingColour ───────────────────────────────────────────────────────────

describe("techRingColour", () => {
  it("has an entry for every TechRing", () => {
    for (const ring of TECH_RINGS) {
      expect(techRingColour).toHaveProperty(ring);
    }
  });

  it("has no extra keys beyond the TechRing values", () => {
    expect(Object.keys(techRingColour)).toHaveLength(TECH_RINGS.length);
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(techRingColour)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("Adopt uses teal (positive)", () => {
    expect(techRingColour["Adopt"]).toContain("teal");
  });

  it("Hold uses rose (negative)", () => {
    expect(techRingColour["Hold"]).toContain("rose");
  });
});

// ── initiativeStatusColour ───────────────────────────────────────────────────

describe("initiativeStatusColour", () => {
  it("has an entry for every InitiativeStatus", () => {
    for (const status of INITIATIVE_STATUSES) {
      expect(initiativeStatusColour).toHaveProperty(status);
    }
  });

  it("has no extra keys beyond the InitiativeStatus values", () => {
    expect(Object.keys(initiativeStatusColour)).toHaveLength(INITIATIVE_STATUSES.length);
  });

  it("all values are non-empty strings containing both bg- and text-", () => {
    for (const value of Object.values(initiativeStatusColour)) {
      expect(value).toMatch(/bg-/);
      expect(value).toMatch(/text-/);
    }
  });

  it("Completed uses teal (success)", () => {
    expect(initiativeStatusColour["Completed"]).toContain("teal");
  });

  it("Cancelled uses rose (negative)", () => {
    expect(initiativeStatusColour["Cancelled"]).toContain("rose");
  });
});
