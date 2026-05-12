/**
 * Step 3.2 — Application and Data Entities
 *
 * Tables: Application, DataObject, Interface
 * Includes lifecycle, fit scores, criticality, TIME/6R classification, subtypes.
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  lifecyclePhaseEnum,
  healthStatusEnum,
  qualitySealEnum,
  applicationSubtypeEnum,
  fitScoreEnum,
  businessCriticalityEnum,
  timeClassificationEnum,
  sixRClassificationEnum,
  interfaceSubtypeEnum,
  dataFlowDirectionEnum,
} from "./enums";

// ── Application ─────────────────────────────────────────────────────────────

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subtype: applicationSubtypeEnum("subtype"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  technicalFit: fitScoreEnum("technical_fit"),
  functionalFit: fitScoreEnum("functional_fit"),
  businessCriticality: businessCriticalityEnum("business_criticality"),
  timeClassification: timeClassificationEnum("time_classification"),
  sixRClassification: sixRClassificationEnum("six_r_classification"),
  version: varchar("version", { length: 100 }),
  parentId: uuid("parent_id"), // suite → module hierarchy
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  parent: one(applications, {
    fields: [applications.parentId],
    references: [applications.id],
    relationName: "application_hierarchy",
  }),
  children: many(applications, {
    relationName: "application_hierarchy",
  }),
}));

// ── Data Object ─────────────────────────────────────────────────────────────

export const dataObjects = pgTable("data_objects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dataClassification: varchar("data_classification", { length: 100 }), // e.g. "Public", "Internal", "Confidential", "Restricted"
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

export const dataObjectsRelations = relations(dataObjects, ({ one, many }) => ({
  parent: one(dataObjects, {
    fields: [dataObjects.parentId],
    references: [dataObjects.id],
    relationName: "data_object_hierarchy",
  }),
  children: many(dataObjects, {
    relationName: "data_object_hierarchy",
  }),
}));

// ── Interface ───────────────────────────────────────────────────────────────

export const interfaces = pgTable("interfaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subtype: interfaceSubtypeEnum("subtype").default("Logical Interface"),
  dataFlowDirection: dataFlowDirectionEnum("data_flow_direction"),
  frequency: varchar("frequency", { length: 100 }), // e.g. "Real-time", "Daily batch", "On-demand"
  providerApplicationId: uuid("provider_application_id"), // FK to applications
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  // MCP-specific fields (only for subtype = "MCP Server")
  endpointUrl: varchar("endpoint_url", { length: 2048 }),
  authProtocol: varchar("auth_protocol", { length: 100 }),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const interfacesRelations = relations(interfaces, ({ one }) => ({
  providerApplication: one(applications, {
    fields: [interfaces.providerApplicationId],
    references: [applications.id],
    relationName: "interface_provider",
  }),
}));
