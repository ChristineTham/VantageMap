/**
 * Step 3.4 — Technology Entities
 *
 * Tables: TechCategory, ITComponent, Provider
 * Includes ring/quadrant for radar placement, lifecycle, end-of-life dates.
 */

import { pgTable, uuid, varchar, text, timestamp, date, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  lifecyclePhaseEnum,
  healthStatusEnum,
  qualitySealEnum,
  techRingEnum,
  techQuadrantEnum,
  itComponentSubtypeEnum,
  technicalStandardEnum,
} from "./enums";

// ── Tech Category ───────────────────────────────────────────────────────────

export const techCategories = pgTable("tech_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  level: integer("level").default(1), // hierarchy depth
  parentId: uuid("parent_id"),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const techCategoriesRelations = relations(techCategories, ({ one, many }) => ({
  parent: one(techCategories, {
    fields: [techCategories.parentId],
    references: [techCategories.id],
    relationName: "tech_category_hierarchy",
  }),
  children: many(techCategories, {
    relationName: "tech_category_hierarchy",
  }),
  itComponents: many(itComponents),
}));

// ── IT Component ────────────────────────────────────────────────────────────

export const itComponents = pgTable("it_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subtype: itComponentSubtypeEnum("subtype"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  version: varchar("version", { length: 100 }),
  technicalStandard: technicalStandardEnum("technical_standard"),
  // Radar placement
  ring: techRingEnum("ring"),
  quadrant: techQuadrantEnum("quadrant"),
  // Lifecycle dates
  endOfLife: date("end_of_life"),
  endOfSupport: date("end_of_support"),
  // Category FK
  techCategoryId: uuid("tech_category_id"),
  // Provider FK
  providerId: uuid("provider_id"),
  // Hierarchy
  parentId: uuid("parent_id"),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const itComponentsRelations = relations(itComponents, ({ one, many }) => ({
  techCategory: one(techCategories, {
    fields: [itComponents.techCategoryId],
    references: [techCategories.id],
  }),
  provider: one(providers, {
    fields: [itComponents.providerId],
    references: [providers.id],
  }),
  parent: one(itComponents, {
    fields: [itComponents.parentId],
    references: [itComponents.id],
    relationName: "it_component_hierarchy",
  }),
  children: many(itComponents, {
    relationName: "it_component_hierarchy",
  }),
}));

// ── Provider ────────────────────────────────────────────────────────────────

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  lifecycle: lifecyclePhaseEnum("lifecycle").default("Active"),
  health: healthStatusEnum("health").default("Good"),
  qualitySeal: qualitySealEnum("quality_seal").default("Draft"),
  location: varchar("location", { length: 255 }),
  contactInfo: text("contact_info"),
  owner: varchar("owner", { length: 255 }),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const providersRelations = relations(providers, ({ many }) => ({
  itComponents: many(itComponents),
}));
