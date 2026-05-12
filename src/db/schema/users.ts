/**
 * Step 3.8 — User, Role, and Workspace Tables
 *
 * Tables: User, Workspace, UserWorkspaceRole
 * User status lifecycle: Active, Invited, Requested, Not Invited, Archived
 * Roles: Viewer, Member, Admin (custom roles via IdP in Phase 14)
 *
 * NOTE: Better Auth will manage the core auth tables (sessions, accounts, etc.).
 * These tables extend Better Auth with VantageMap-specific fields.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userStatusEnum, standardRoleEnum } from "./enums";

// ── User (extends Better Auth user table) ───────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 2048 }),
  status: userStatusEnum("status").notNull().default("Invited"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaceRoles: many(userWorkspaceRoles),
}));

// ── Workspace ───────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(userWorkspaceRoles),
}));

// ── User ↔ Workspace ↔ Role Join Table ──────────────────────────────────────

export const userWorkspaceRoles = pgTable(
  "user_workspace_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: standardRoleEnum("role").notNull().default("Viewer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_uwr_user").on(table.userId),
    index("idx_uwr_workspace").on(table.workspaceId),
    unique("uq_user_workspace").on(table.userId, table.workspaceId),
  ]
);

export const userWorkspaceRolesRelations = relations(userWorkspaceRoles, ({ one }) => ({
  user: one(users, {
    fields: [userWorkspaceRoles.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [userWorkspaceRoles.workspaceId],
    references: [workspaces.id],
  }),
}));
