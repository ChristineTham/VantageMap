/**
 * Phase 12.3 — Webhook Database Schema
 *
 * Tables:
 * - webhooks: Webhook subscriptions (url, events, secret, active)
 * - webhook_deliveries: Delivery log with status, attempts, response
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { factSheetTypeEnum } from "./enums";

// ── Webhook Subscriptions ───────────────────────────────────────────────────

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Target URL to receive POST requests */
    url: text("url").notNull(),
    /** Array of event patterns this webhook subscribes to (e.g. "application.created") */
    events: jsonb("events").$type<string[]>().notNull().default([]),
    /** HMAC secret for request signing (stored hashed) */
    secret: text("secret"),
    /** Whether the webhook is currently active */
    active: boolean("active").notNull().default(true),
    /** Optional human-readable name */
    name: varchar("name", { length: 255 }),
    /** Description */
    description: text("description"),
    /** Owner user ID */
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("webhooks_active_idx").on(table.active),
    index("webhooks_created_by_idx").on(table.createdBy),
  ]
);

// ── Webhook Delivery Log ────────────────────────────────────────────────────

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Reference to the webhook subscription */
    webhookId: uuid("webhook_id")
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),
    /** The event that triggered this delivery */
    event: varchar("event", { length: 100 }).notNull(),
    /** Full request payload sent */
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    /** HTTP status code from the target */
    statusCode: integer("status_code"),
    /** Response body (truncated to 4KB) */
    responseBody: text("response_body"),
    /** Delivery status */
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    /** Number of delivery attempts */
    attempts: integer("attempts").notNull().default(0),
    /** Maximum retry attempts allowed */
    maxAttempts: integer("max_attempts").notNull().default(3),
    /** Next retry time (null if complete or abandoned) */
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    /** Error message if delivery failed */
    errorMessage: text("error_message"),
    /** Delivery duration in ms */
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("deliveries_webhook_id_idx").on(table.webhookId),
    index("deliveries_status_idx").on(table.status),
    index("deliveries_next_retry_idx").on(table.nextRetryAt),
  ]
);
