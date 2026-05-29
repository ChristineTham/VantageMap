-- Phase 12.3 — Webhook Infrastructure Migration
-- Creates webhook subscriptions and delivery log tables

CREATE TABLE IF NOT EXISTS "webhooks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "url" text NOT NULL,
  "events" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "secret" text,
  "active" boolean NOT NULL DEFAULT true,
  "name" varchar(255),
  "description" text,
  "created_by" uuid,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "webhooks_active_idx" ON "webhooks" ("active");
CREATE INDEX IF NOT EXISTS "webhooks_created_by_idx" ON "webhooks" ("created_by");

CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "webhook_id" uuid NOT NULL REFERENCES "webhooks"("id") ON DELETE CASCADE,
  "event" varchar(100) NOT NULL,
  "payload" jsonb NOT NULL,
  "status_code" integer,
  "response_body" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "next_retry_at" timestamp with time zone,
  "error_message" text,
  "duration_ms" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "completed_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "deliveries_webhook_id_idx" ON "webhook_deliveries" ("webhook_id");
CREATE INDEX IF NOT EXISTS "deliveries_status_idx" ON "webhook_deliveries" ("status");
CREATE INDEX IF NOT EXISTS "deliveries_next_retry_idx" ON "webhook_deliveries" ("next_retry_at");
