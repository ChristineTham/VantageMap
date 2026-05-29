/**
 * Phase 11.3 — Quality Seal State Machine
 *
 * Defines valid transitions for the quality seal workflow.
 * Enforces role-based permissions for each transition.
 *
 * State diagram:
 *   Draft ──→ Check Needed ──→ Approved
 *                  │                │
 *                  └── Rejected ←───┘
 *                  │                │
 *                  └────── Draft ←──┘
 *
 * Transition rules:
 *   - Draft → Check Needed: Any Member or Admin (owner submits for review)
 *   - Check Needed → Approved: Admin only (approver signs off)
 *   - Check Needed → Rejected: Admin only (approver rejects)
 *   - Rejected → Draft: Any Member or Admin (owner revises)
 *   - Approved → Check Needed: Admin only (re-review requested)
 */

import type { StandardRole } from "@/lib/auth";

export type QualitySealState = "Draft" | "Check Needed" | "Approved" | "Rejected";

interface Transition {
  from: QualitySealState;
  to: QualitySealState;
  allowedRoles: StandardRole[];
  label: string;
}

export const QUALITY_SEAL_TRANSITIONS: Transition[] = [
  {
    from: "Draft",
    to: "Check Needed",
    allowedRoles: ["Member", "Admin"],
    label: "Submit for Review",
  },
  {
    from: "Check Needed",
    to: "Approved",
    allowedRoles: ["Admin"],
    label: "Approve",
  },
  {
    from: "Check Needed",
    to: "Rejected",
    allowedRoles: ["Admin"],
    label: "Reject",
  },
  {
    from: "Rejected",
    to: "Draft",
    allowedRoles: ["Member", "Admin"],
    label: "Revise",
  },
  {
    from: "Approved",
    to: "Check Needed",
    allowedRoles: ["Admin"],
    label: "Request Re-review",
  },
];

/**
 * Get valid transitions from a given state for a given role.
 */
export function getValidTransitions(
  currentState: QualitySealState,
  role: StandardRole
): Transition[] {
  return QUALITY_SEAL_TRANSITIONS.filter(
    (t) => t.from === currentState && t.allowedRoles.includes(role)
  );
}

/**
 * Check if a specific transition is allowed.
 */
export function isTransitionAllowed(
  from: QualitySealState,
  to: QualitySealState,
  role: StandardRole
): boolean {
  return QUALITY_SEAL_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role)
  );
}

/**
 * Get the display label for a transition.
 */
export function getTransitionLabel(from: QualitySealState, to: QualitySealState): string | null {
  const transition = QUALITY_SEAL_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition?.label ?? null;
}
