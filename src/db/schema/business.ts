/**
 * Step 3.1 — Business Architecture Entities
 *
 * Tables: BusinessCapability, Organization, BusinessContext
 * Hierarchical, with lifecycle, health, subtypes, and custom fields.
 */

import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  capabilityLevelEnum,
  lifecyclePhaseEnum,
  healthStatusEnum,
  qualitySealEnum,
  organizationSubtypeEnum,
  businessContextSubtypeEnum,
} from "./enums";

// ── Business Capability ─────────────────────────────────────────────────────

export const businessCapabilities = pgTable("business_capabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  level: capabilityLevelEnum("level").notNull().default("1"),
  parentId: uuid("parent_id"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  maturity: integer("maturity"), // 1–5
  strategicImportance: integer("strategic_importance"), // 1–5
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const businessCapabilitiesRelations = relations(businessCapabilities, ({ one, many }) => ({
  parent: one(businessCapabilities, {
    fields: [businessCapabilities.parentId],
    references: [businessCapabilities.id],
    relationName: "capability_hierarchy",
  }),
  children: many(businessCapabilities, {
    relationName: "capability_hierarchy",
  }),
}));

// ── Organization ────────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subtype: organizationSubtypeEnum("subtype").notNull().default("Business Unit"),
  level: integer("level").default(1), // hierarchy depth
  parentId: uuid("parent_id"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  parent: one(organizations, {
    fields: [organizations.parentId],
    references: [organizations.id],
    relationName: "organization_hierarchy",
  }),
  children: many(organizations, {
    relationName: "organization_hierarchy",
  }),
}));

// ── Business Context ────────────────────────────────────────────────────────

export const businessContexts = pgTable("business_contexts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subtype: businessContextSubtypeEnum("subtype").notNull().default("Process"),
  level: integer("level").default(1),
  parentId: uuid("parent_id"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const businessContextsRelations = relations(businessContexts, ({ one, many }) => ({
  parent: one(businessContexts, {
    fields: [businessContexts.parentId],
    references: [businessContexts.id],
    relationName: "business_context_hierarchy",
  }),
  children: many(businessContexts, {
    relationName: "business_context_hierarchy",
  }),
}));
