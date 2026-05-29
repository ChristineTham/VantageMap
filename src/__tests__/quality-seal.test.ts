/**
 * Phase 11.3 — Quality Seal State Machine Tests
 */

import { describe, it, expect } from "vitest";
import { getValidTransitions, isTransitionAllowed, getTransitionLabel } from "@/lib/quality-seal";

describe("Quality Seal State Machine", () => {
  describe("getValidTransitions", () => {
    it("returns 'Submit for Review' from Draft for Member", () => {
      const transitions = getValidTransitions("Draft", "Member");
      expect(transitions).toHaveLength(1);
      expect(transitions[0].to).toBe("Check Needed");
      expect(transitions[0].label).toBe("Submit for Review");
    });

    it("returns 'Submit for Review' from Draft for Admin", () => {
      const transitions = getValidTransitions("Draft", "Admin");
      expect(transitions).toHaveLength(1);
      expect(transitions[0].to).toBe("Check Needed");
    });

    it("returns nothing from Draft for Viewer", () => {
      const transitions = getValidTransitions("Draft", "Viewer");
      expect(transitions).toHaveLength(0);
    });

    it("returns Approve and Reject from Check Needed for Admin", () => {
      const transitions = getValidTransitions("Check Needed", "Admin");
      expect(transitions).toHaveLength(2);
      const toStates = transitions.map((t) => t.to);
      expect(toStates).toContain("Approved");
      expect(toStates).toContain("Rejected");
    });

    it("returns nothing from Check Needed for Member", () => {
      const transitions = getValidTransitions("Check Needed", "Member");
      expect(transitions).toHaveLength(0);
    });

    it("returns 'Revise' from Rejected for Member", () => {
      const transitions = getValidTransitions("Rejected", "Member");
      expect(transitions).toHaveLength(1);
      expect(transitions[0].to).toBe("Draft");
      expect(transitions[0].label).toBe("Revise");
    });

    it("returns 'Request Re-review' from Approved for Admin", () => {
      const transitions = getValidTransitions("Approved", "Admin");
      expect(transitions).toHaveLength(1);
      expect(transitions[0].to).toBe("Check Needed");
    });

    it("returns nothing from Approved for Member", () => {
      const transitions = getValidTransitions("Approved", "Member");
      expect(transitions).toHaveLength(0);
    });
  });

  describe("isTransitionAllowed", () => {
    it("allows Draft → Check Needed for Member", () => {
      expect(isTransitionAllowed("Draft", "Check Needed", "Member")).toBe(true);
    });

    it("allows Check Needed → Approved for Admin", () => {
      expect(isTransitionAllowed("Check Needed", "Approved", "Admin")).toBe(true);
    });

    it("denies Check Needed → Approved for Member", () => {
      expect(isTransitionAllowed("Check Needed", "Approved", "Member")).toBe(false);
    });

    it("denies Draft → Approved (skip not allowed)", () => {
      expect(isTransitionAllowed("Draft", "Approved", "Admin")).toBe(false);
    });

    it("denies any transition for Viewer", () => {
      expect(isTransitionAllowed("Draft", "Check Needed", "Viewer")).toBe(false);
      expect(isTransitionAllowed("Check Needed", "Approved", "Viewer")).toBe(false);
    });
  });

  describe("getTransitionLabel", () => {
    it("returns label for valid transition", () => {
      expect(getTransitionLabel("Draft", "Check Needed")).toBe("Submit for Review");
      expect(getTransitionLabel("Check Needed", "Approved")).toBe("Approve");
      expect(getTransitionLabel("Check Needed", "Rejected")).toBe("Reject");
      expect(getTransitionLabel("Rejected", "Draft")).toBe("Revise");
      expect(getTransitionLabel("Approved", "Check Needed")).toBe("Request Re-review");
    });

    it("returns null for invalid transition", () => {
      expect(getTransitionLabel("Draft", "Approved")).toBeNull();
      expect(getTransitionLabel("Approved", "Draft")).toBeNull();
    });
  });
});
