/**
 * Step 7.2 — Frontend TypeScript Types
 *
 * Types matching the database models from src/db/schema/*.ts.
 * Used by the API client (src/lib/api.ts) and all frontend components.
 *
 * These are the "view" types — they mirror the database columns
 * but with TypeScript-native types (string for UUIDs, enums as unions, etc.).
 */

// ── Shared Enums ────────────────────────────────────────────────────────────

export type HealthStatus = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
export type LifecyclePhase = "Plan" | "Phase In" | "Active" | "Phase Out" | "End of Life";
export type QualitySeal = "Draft" | "Check Needed" | "Approved" | "Rejected";

// ── Fact Sheet Type Identifier ──────────────────────────────────────────────

export type FactSheetType =
  | "BusinessCapability"
  | "Organization"
  | "BusinessContext"
  | "Application"
  | "DataObject"
  | "Interface"
  | "StrategicObjective"
  | "Initiative"
  | "Platform"
  | "TechCategory"
  | "ITComponent"
  | "Provider";

// ── Business Architecture ───────────────────────────────────────────────────

export type CapabilityLevel = "1" | "2" | "3";

export interface BusinessCapability {
  id: string;
  name: string;
  description: string | null;
  level: CapabilityLevel;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  maturity: number | null;
  strategicImportance: number | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationSubtype = "Business Unit" | "Customer" | "Region" | "Legal Entity" | "Team";

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  subtype: OrganizationSubtype;
  level: number | null;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type BusinessContextSubtype =
  | "Business Product"
  | "Customer Journey"
  | "Process"
  | "Value Stream"
  | "ESG Capability";

export interface BusinessContext {
  id: string;
  name: string;
  description: string | null;
  subtype: BusinessContextSubtype;
  level: number | null;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Application & Data Architecture ─────────────────────────────────────────

export type ApplicationSubtype = "Business Application" | "Microservice" | "AI Agent";
export type FitScore = "Insufficient" | "Adequate" | "Full";
export type BusinessCriticality = "Administrative Service" | "Relevant" | "Important" | "Mission Critical";
export type TimeClassification = "Tolerate" | "Invest" | "Migrate" | "Eliminate";
export type SixRClassification = "Retire" | "Retain" | "Repurchase" | "Rehost" | "Replatform" | "Rearchitect";

export interface Application {
  id: string;
  name: string;
  description: string | null;
  subtype: ApplicationSubtype | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  technicalFit: FitScore | null;
  functionalFit: FitScore | null;
  businessCriticality: BusinessCriticality | null;
  timeClassification: TimeClassification | null;
  sixRClassification: SixRClassification | null;
  version: string | null;
  parentId: string | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DataObject {
  id: string;
  name: string;
  description: string | null;
  dataClassification: string | null;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type InterfaceSubtype = "Logical Interface" | "API" | "MCP Server";
export type DataFlowDirection = "Incoming" | "Outgoing" | "Bi-Directional";

export interface InterfaceEntity {
  id: string;
  name: string;
  description: string | null;
  subtype: InterfaceSubtype | null;
  dataFlowDirection: DataFlowDirection | null;
  frequency: string | null;
  providerApplicationId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  endpointUrl: string | null;
  authProtocol: string | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Strategy & Transformation ───────────────────────────────────────────────

export type StrategicPerspective = "Financial" | "Customer" | "Internal Process" | "Learning & Growth";

export interface StrategicObjective {
  id: string;
  name: string;
  description: string | null;
  perspective: StrategicPerspective;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  objectiveId: string;
  name: string;
  description: string | null;
  targetValue: string | null;
  currentValue: string | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InitiativeSubtype = "Idea" | "Program" | "Project" | "Epic";
export type InitiativeStatus = "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled";

export interface Initiative {
  id: string;
  name: string;
  description: string | null;
  subtype: InitiativeSubtype | null;
  status: InitiativeStatus | null;
  startDate: string | null;
  endDate: string | null;
  budget: string | null;
  parentId: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Platform {
  id: string;
  name: string;
  description: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Technical Architecture ──────────────────────────────────────────────────

export interface TechCategory {
  id: string;
  name: string;
  description: string | null;
  level: number | null;
  parentId: string | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type ITComponentSubtype = "Hardware" | "IaaS" | "PaaS" | "SaaS" | "Service" | "Software" | "AI Model";
export type TechnicalStandard = "Approved" | "Approved with constraints" | "Deprecated";
export type TechRing = "Adopt" | "Trial" | "Assess" | "Hold";
export type TechQuadrant = "Techniques" | "Tools" | "Platforms" | "Languages & Frameworks";

export interface ITComponent {
  id: string;
  name: string;
  description: string | null;
  subtype: ITComponentSubtype | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  version: string | null;
  technicalStandard: TechnicalStandard | null;
  ring: TechRing | null;
  quadrant: TechQuadrant | null;
  endOfLife: string | null;
  endOfSupport: string | null;
  techCategoryId: string | null;
  providerId: string | null;
  parentId: string | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string | null;
  lifecycle: LifecyclePhase | null;
  health: HealthStatus | null;
  qualitySeal: QualitySeal | null;
  location: string | null;
  contactInfo: string | null;
  owner: string | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Relationships ───────────────────────────────────────────────────────────

export type RelationshipType =
  | "supports"
  | "supported by"
  | "used by"
  | "uses"
  | "used in"
  | "provides"
  | "consumes"
  | "processes"
  | "manages"
  | "runs on"
  | "depends on"
  | "belongs to"
  | "contains"
  | "in scope of"
  | "impacts"
  | "improves"
  | "drives"
  | "linked to"
  | "related to"
  | "performed by"
  | "assigned to"
  | "owns"
  | "owned by"
  | "offered by"
  | "classified in"
  | "classifies"
  | "implements"
  | "implemented via"
  | "transfers"
  | "transferred via"
  | "involved in"
  | "requires"
  | "required by"
  | "parent"
  | "child";

export interface Relationship {
  id: string;
  sourceType: FactSheetType;
  sourceId: string;
  targetType: FactSheetType;
  targetId: string;
  relationshipType: RelationshipType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Colour Utility Maps ─────────────────────────────────────────────────────

/** Tailwind text colour class for each HealthStatus value. */
export const healthColour: Record<HealthStatus, string> = {
  Excellent: "text-rosely-teal",
  Good: "text-rosely-teal",
  Fair: "text-rosely-golden",
  Poor: "text-rosely-flamingo",
  Critical: "text-rosely-rose",
};

/** Tailwind background colour class for each HealthStatus value (badge style). */
export const healthBg: Record<HealthStatus, string> = {
  Excellent: "bg-rosely-teal/20 text-rosely-teal",
  Good: "bg-rosely-teal/20 text-rosely-teal",
  Fair: "bg-rosely-golden/20 text-rosely-night",
  Poor: "bg-rosely-flamingo/20 text-rosely-rose",
  Critical: "bg-rosely-rose/20 text-rosely-rose",
};

/** Tailwind class for each InitiativeStatus value. */
export const initiativeStatusColour: Record<InitiativeStatus, string> = {
  "Not Started": "bg-rosely-mist/20 text-rosely-dusk",
  "In Progress": "bg-rosely-periwinkle/20 text-rosely-cornflower",
  Completed: "bg-rosely-teal/20 text-rosely-teal",
  "On Hold": "bg-rosely-golden/20 text-rosely-night",
  Cancelled: "bg-rosely-rose/20 text-rosely-rose",
};

/** Tailwind class for each LifecyclePhase value. */
export const lifecycleColour: Record<LifecyclePhase, string> = {
  Plan: "bg-rosely-periwinkle/20 text-rosely-cornflower",
  "Phase In": "bg-rosely-lilac/20 text-rosely-plum",
  Active: "bg-rosely-teal/20 text-rosely-teal",
  "Phase Out": "bg-rosely-flamingo/20 text-rosely-rose",
  "End of Life": "bg-rosely-rose/20 text-rosely-rose",
};

/** Tailwind class for each TechRing value. */
export const techRingColour: Record<TechRing, string> = {
  Adopt: "bg-rosely-teal/20 text-rosely-teal",
  Trial: "bg-rosely-periwinkle/20 text-rosely-cornflower",
  Assess: "bg-rosely-golden/20 text-rosely-night",
  Hold: "bg-rosely-rose/20 text-rosely-rose",
};
