/**
 * Shared PostgreSQL enums used across multiple schema files.
 * Centralised here to avoid circular imports between bounded contexts.
 */

import { pgEnum } from "drizzle-orm/pg-core";

// ── Lifecycle & Health ──────────────────────────────────────────────────────

export const lifecyclePhaseEnum = pgEnum("lifecycle_phase", [
  "Plan",
  "Phase In",
  "Active",
  "Phase Out",
  "End of Life",
]);

export const healthStatusEnum = pgEnum("health_status", [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Critical",
]);

// ── Business Capability ─────────────────────────────────────────────────────

export const capabilityLevelEnum = pgEnum("capability_level", ["1", "2", "3"]);

// ── Organization ────────────────────────────────────────────────────────────

export const organizationSubtypeEnum = pgEnum("organization_subtype", [
  "Business Unit",
  "Customer",
  "Region",
  "Legal Entity",
  "Team",
]);

// ── Business Context ────────────────────────────────────────────────────────

export const businessContextSubtypeEnum = pgEnum("business_context_subtype", [
  "Business Product",
  "Customer Journey",
  "Process",
  "Value Stream",
  "ESG Capability",
]);

// ── Application ─────────────────────────────────────────────────────────────

export const applicationSubtypeEnum = pgEnum("application_subtype", [
  "Business Application",
  "Microservice",
  "AI Agent",
]);

export const fitScoreEnum = pgEnum("fit_score", ["Insufficient", "Adequate", "Full"]);

export const businessCriticalityEnum = pgEnum("business_criticality", [
  "Administrative Service",
  "Relevant",
  "Important",
  "Mission Critical",
]);

export const timeClassificationEnum = pgEnum("time_classification", [
  "Tolerate",
  "Invest",
  "Migrate",
  "Eliminate",
]);

export const sixRClassificationEnum = pgEnum("six_r_classification", [
  "Retire",
  "Retain",
  "Repurchase",
  "Rehost",
  "Replatform",
  "Rearchitect",
]);

// ── Interface ───────────────────────────────────────────────────────────────

export const interfaceSubtypeEnum = pgEnum("interface_subtype", [
  "Logical Interface",
  "API",
  "MCP Server",
]);

export const dataFlowDirectionEnum = pgEnum("data_flow_direction", [
  "Incoming",
  "Outgoing",
  "Bi-Directional",
]);

// ── Initiative ──────────────────────────────────────────────────────────────

export const initiativeSubtypeEnum = pgEnum("initiative_subtype", [
  "Idea",
  "Program",
  "Project",
  "Epic",
]);

export const initiativeStatusEnum = pgEnum("initiative_status", [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
]);

// ── Strategic Objective ─────────────────────────────────────────────────────

export const strategicPerspectiveEnum = pgEnum("strategic_perspective", [
  "Financial",
  "Customer",
  "Internal Process",
  "Learning & Growth",
]);

// ── Technology ──────────────────────────────────────────────────────────────

export const techRingEnum = pgEnum("tech_ring", ["Adopt", "Trial", "Assess", "Hold"]);

export const techQuadrantEnum = pgEnum("tech_quadrant", [
  "Techniques",
  "Tools",
  "Platforms",
  "Languages & Frameworks",
]);

export const itComponentSubtypeEnum = pgEnum("it_component_subtype", [
  "Hardware",
  "IaaS",
  "PaaS",
  "SaaS",
  "Service",
  "Software",
  "AI Model",
]);

export const technicalStandardEnum = pgEnum("technical_standard", [
  "Approved",
  "Approved with constraints",
  "Deprecated",
]);

// ── Tags ────────────────────────────────────────────────────────────────────

export const tagModeEnum = pgEnum("tag_mode", ["on-the-fly", "hybrid", "predefined-only"]);

// ── Subscriptions ───────────────────────────────────────────────────────────

export const subscriptionRoleEnum = pgEnum("subscription_role", [
  "Responsible",
  "Accountable",
  "Observer",
]);

// ── Audit ───────────────────────────────────────────────────────────────────

export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete"]);

// ── User ────────────────────────────────────────────────────────────────────

export const userStatusEnum = pgEnum("user_status", [
  "Active",
  "Invited",
  "Requested",
  "Not Invited",
  "Archived",
]);

export const standardRoleEnum = pgEnum("standard_role", ["Viewer", "Member", "Admin"]);

// ── Quality Seal ────────────────────────────────────────────────────────────

export const qualitySealEnum = pgEnum("quality_seal", [
  "Draft",
  "Check Needed",
  "Approved",
  "Rejected",
]);

// ── Fact Sheet Type (for polymorphic references) ────────────────────────────

export const factSheetTypeEnum = pgEnum("fact_sheet_type", [
  "BusinessCapability",
  "Organization",
  "BusinessContext",
  "Application",
  "DataObject",
  "Interface",
  "StrategicObjective",
  "Initiative",
  "Platform",
  "TechCategory",
  "ITComponent",
  "Provider",
]);

// ── Relationship Type ───────────────────────────────────────────────────────

export const relationshipTypeEnum = pgEnum("relationship_type", [
  "supports",
  "supported by",
  "used by",
  "uses",
  "used in",
  "provides",
  "consumes",
  "processes",
  "manages",
  "runs on",
  "depends on",
  "belongs to",
  "contains",
  "in scope of",
  "impacts",
  "improves",
  "drives",
  "linked to",
  "related to",
  "performed by",
  "assigned to",
  "owns",
  "owned by",
  "offered by",
  "classified in",
  "classifies",
  "implements",
  "implemented via",
  "transfers",
  "transferred via",
  "involved in",
  "requires",
  "required by",
  "parent",
  "child",
]);
