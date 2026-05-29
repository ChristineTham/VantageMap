/**
 * Database schema barrel — re-exports all entity tables and relations.
 *
 * Bounded contexts:
 *   enums.ts         — shared PostgreSQL enums
 *   business.ts      — BusinessCapability, Organization, BusinessContext
 *   applications.ts  — Application, DataObject, Interface
 *   strategy.ts      — StrategicObjective, KPI, Initiative, Platform
 *   technology.ts    — TechCategory, ITComponent, Provider
 *   relationships.ts — generic edge table
 *   tags.ts          — TagGroup, Tag, TagAssignment, Subscription
 *   audit.ts         — AuditEntry
 *   users.ts         — User, Workspace, UserWorkspaceRole
 *   api-tokens.ts    — API Tokens for technical users (Phase 10)
 *   governance.ts    — Comments, Todos, Surveys, QualitySealTransitions (Phase 11)
 */

export * from "./enums";
export * from "./business";
export * from "./applications";
export * from "./strategy";
export * from "./technology";
export * from "./relationships";
export * from "./tags";
export * from "./audit";
export * from "./users";
export * from "./api-tokens";
export * from "./governance";
