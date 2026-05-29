/**
 * Phase 9 — Fact Sheet Configuration Registry
 *
 * Central mapping between fact sheet types, their URL slugs, API clients,
 * display names, field schemas, and form metadata.
 */

import type { FactSheetType } from "@/lib/types";

// ── Field Definition ────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number"
  | "url"
  | "json";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  group?: string;
}

// ── Fact Sheet Config ───────────────────────────────────────────────────────

export interface FactSheetConfig {
  type: FactSheetType;
  slug: string;
  displayName: string;
  pluralName: string;
  apiPath: string;
  icon: string;
  fields: FieldDefinition[];
}

// ── Shared Field Definitions ────────────────────────────────────────────────

const lifecycleOptions = ["Plan", "Phase In", "Active", "Phase Out", "End of Life"];
const healthOptions = ["Excellent", "Good", "Fair", "Poor", "Critical"];
const qualitySealOptions = ["Draft", "Check Needed", "Approved", "Rejected"];

const commonFields: FieldDefinition[] = [
  { key: "name", label: "Name", type: "text", required: true, group: "General" },
  { key: "description", label: "Description", type: "textarea", group: "General" },
  { key: "lifecycle", label: "Lifecycle Phase", type: "select", options: lifecycleOptions, group: "Status" },
  { key: "health", label: "Health Status", type: "select", options: healthOptions, group: "Status" },
  { key: "qualitySeal", label: "Quality Seal", type: "select", options: qualitySealOptions, group: "Governance" },
  { key: "owner", label: "Owner", type: "text", group: "Governance" },
];

// ── Config Registry ─────────────────────────────────────────────────────────

export const FACT_SHEET_CONFIGS: FactSheetConfig[] = [
  {
    type: "BusinessCapability",
    slug: "capabilities",
    displayName: "Business Capability",
    pluralName: "Business Capabilities",
    apiPath: "/api/capabilities",
    icon: "Layers",
    fields: [
      ...commonFields,
      { key: "level", label: "Level", type: "select", options: ["1", "2", "3"], required: true, group: "Hierarchy" },
      { key: "parentId", label: "Parent Capability", type: "text", placeholder: "Parent capability ID", group: "Hierarchy" },
      { key: "maturity", label: "Maturity Score", type: "number", group: "Assessment" },
      { key: "strategicImportance", label: "Strategic Importance", type: "number", group: "Assessment" },
    ],
  },
  {
    type: "Application",
    slug: "applications",
    displayName: "Application",
    pluralName: "Applications",
    apiPath: "/api/applications",
    icon: "AppWindow",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Business Application", "Microservice", "AI Agent"], group: "Classification" },
      { key: "technicalFit", label: "Technical Fit", type: "select", options: ["Insufficient", "Adequate", "Full"], group: "Assessment" },
      { key: "functionalFit", label: "Functional Fit", type: "select", options: ["Insufficient", "Adequate", "Full"], group: "Assessment" },
      { key: "businessCriticality", label: "Business Criticality", type: "select", options: ["Administrative Service", "Relevant", "Important", "Mission Critical"], group: "Classification" },
      { key: "timeClassification", label: "TIME Classification", type: "select", options: ["Tolerate", "Invest", "Migrate", "Eliminate"], group: "Classification" },
      { key: "sixRClassification", label: "6R Classification", type: "select", options: ["Retire", "Retain", "Repurchase", "Rehost", "Replatform", "Rearchitect"], group: "Classification" },
      { key: "version", label: "Version", type: "text", group: "General" },
      { key: "parentId", label: "Parent Application", type: "text", placeholder: "Parent application ID", group: "Hierarchy" },
    ],
  },
  {
    type: "StrategicObjective",
    slug: "objectives",
    displayName: "Strategic Objective",
    pluralName: "Strategic Objectives",
    apiPath: "/api/objectives",
    icon: "Target",
    fields: [
      ...commonFields,
      { key: "perspective", label: "Perspective", type: "select", options: ["Financial", "Customer", "Internal Process", "Learning & Growth"], required: true, group: "Classification" },
      { key: "parentId", label: "Parent Objective", type: "text", placeholder: "Parent objective ID", group: "Hierarchy" },
    ],
  },
  {
    type: "Initiative",
    slug: "initiatives",
    displayName: "Initiative",
    pluralName: "Initiatives",
    apiPath: "/api/initiatives",
    icon: "Rocket",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Idea", "Program", "Project", "Epic"], group: "Classification" },
      { key: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"], group: "Status" },
      { key: "startDate", label: "Start Date", type: "date", group: "Timeline" },
      { key: "endDate", label: "End Date", type: "date", group: "Timeline" },
      { key: "budget", label: "Budget", type: "text", placeholder: "e.g. 500000", group: "Planning" },
      { key: "parentId", label: "Parent Initiative", type: "text", placeholder: "Parent initiative ID", group: "Hierarchy" },
    ],
  },
  {
    type: "ITComponent",
    slug: "it-components",
    displayName: "IT Component",
    pluralName: "IT Components",
    apiPath: "/api/it-components",
    icon: "Cpu",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Hardware", "IaaS", "PaaS", "SaaS", "Service", "Software", "AI Model"], group: "Classification" },
      { key: "version", label: "Version", type: "text", group: "General" },
      { key: "technicalStandard", label: "Technical Standard", type: "select", options: ["Approved", "Approved with constraints", "Deprecated"], group: "Classification" },
      { key: "ring", label: "Radar Ring", type: "select", options: ["Adopt", "Trial", "Assess", "Hold"], group: "Radar" },
      { key: "quadrant", label: "Radar Quadrant", type: "select", options: ["Techniques", "Tools", "Platforms", "Languages & Frameworks"], group: "Radar" },
      { key: "endOfLife", label: "End of Life", type: "date", group: "Timeline" },
      { key: "endOfSupport", label: "End of Support", type: "date", group: "Timeline" },
      { key: "techCategoryId", label: "Tech Category", type: "text", placeholder: "Category ID", group: "Hierarchy" },
      { key: "providerId", label: "Provider", type: "text", placeholder: "Provider ID", group: "Classification" },
      { key: "parentId", label: "Parent Component", type: "text", placeholder: "Parent ID", group: "Hierarchy" },
    ],
  },
  {
    type: "Organization",
    slug: "organizations",
    displayName: "Organization",
    pluralName: "Organizations",
    apiPath: "/api/organizations",
    icon: "Building2",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Business Unit", "Customer", "Region", "Legal Entity", "Team"], required: true, group: "Classification" },
      { key: "level", label: "Level", type: "number", group: "Hierarchy" },
      { key: "parentId", label: "Parent Organization", type: "text", placeholder: "Parent organization ID", group: "Hierarchy" },
    ],
  },
  {
    type: "DataObject",
    slug: "data-objects",
    displayName: "Data Object",
    pluralName: "Data Objects",
    apiPath: "/api/data-objects",
    icon: "Database",
    fields: [
      ...commonFields,
      { key: "dataClassification", label: "Data Classification", type: "text", group: "Classification" },
      { key: "parentId", label: "Parent Data Object", type: "text", placeholder: "Parent ID", group: "Hierarchy" },
    ],
  },
  {
    type: "Interface",
    slug: "interfaces",
    displayName: "Interface",
    pluralName: "Interfaces",
    apiPath: "/api/interfaces",
    icon: "Cable",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Logical Interface", "API", "MCP Server"], group: "Classification" },
      { key: "dataFlowDirection", label: "Data Flow Direction", type: "select", options: ["Incoming", "Outgoing", "Bi-Directional"], group: "Classification" },
      { key: "frequency", label: "Frequency", type: "text", placeholder: "e.g. Real-time, Daily", group: "General" },
      { key: "endpointUrl", label: "Endpoint URL", type: "url", group: "Technical" },
      { key: "authProtocol", label: "Auth Protocol", type: "text", placeholder: "e.g. OAuth 2.0, API Key", group: "Technical" },
      { key: "providerApplicationId", label: "Provider Application", type: "text", placeholder: "Application ID", group: "Classification" },
    ],
  },
  {
    type: "Provider",
    slug: "providers",
    displayName: "Provider",
    pluralName: "Providers",
    apiPath: "/api/providers",
    icon: "Building",
    fields: [
      ...commonFields,
      { key: "location", label: "Location", type: "text", group: "General" },
      { key: "contactInfo", label: "Contact Info", type: "text", group: "General" },
    ],
  },
  {
    type: "Platform",
    slug: "platforms",
    displayName: "Platform",
    pluralName: "Platforms",
    apiPath: "/api/platforms",
    icon: "Server",
    fields: [
      ...commonFields,
    ],
  },
  {
    type: "TechCategory",
    slug: "tech-categories",
    displayName: "Tech Category",
    pluralName: "Tech Categories",
    apiPath: "/api/tech-categories",
    icon: "FolderTree",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, group: "General" },
      { key: "description", label: "Description", type: "textarea", group: "General" },
      { key: "level", label: "Level", type: "number", group: "Hierarchy" },
      { key: "parentId", label: "Parent Category", type: "text", placeholder: "Parent ID", group: "Hierarchy" },
      { key: "owner", label: "Owner", type: "text", group: "Governance" },
    ],
  },
  {
    type: "BusinessContext",
    slug: "business-contexts",
    displayName: "Business Context",
    pluralName: "Business Contexts",
    apiPath: "/api/business-contexts",
    icon: "Workflow",
    fields: [
      ...commonFields,
      { key: "subtype", label: "Subtype", type: "select", options: ["Business Product", "Customer Journey", "Process", "Value Stream", "ESG Capability"], required: true, group: "Classification" },
      { key: "level", label: "Level", type: "number", group: "Hierarchy" },
      { key: "parentId", label: "Parent Context", type: "text", placeholder: "Parent ID", group: "Hierarchy" },
    ],
  },
];

// ── Lookup Helpers ──────────────────────────────────────────────────────────

export function getConfigByType(type: FactSheetType): FactSheetConfig | undefined {
  return FACT_SHEET_CONFIGS.find((c) => c.type === type);
}

export function getConfigBySlug(slug: string): FactSheetConfig | undefined {
  return FACT_SHEET_CONFIGS.find((c) => c.slug === slug);
}

/** All valid slugs for dynamic routing. */
export function getAllSlugs(): string[] {
  return FACT_SHEET_CONFIGS.map((c) => c.slug);
}

/** Map of slug → FactSheetType for quick lookup. */
export const SLUG_TO_TYPE: Record<string, FactSheetType> = Object.fromEntries(
  FACT_SHEET_CONFIGS.map((c) => [c.slug, c.type])
) as Record<string, FactSheetType>;
