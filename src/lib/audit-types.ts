/**
 * Shared type aliases for audit logging.
 * Separated from audit.ts to avoid circular imports with schema types.
 */

/** Fact sheet type identifiers matching the fact_sheet_type PostgreSQL enum. */
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

/** Audit action types matching the audit_action PostgreSQL enum. */
export type AuditAction = "create" | "update" | "delete";
