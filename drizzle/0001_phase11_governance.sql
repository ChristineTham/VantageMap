-- Phase 11 — Governance and Data Quality Tables
-- Comments, Todos, Surveys, Quality Seal Transitions

-- Comments (threaded, per fact sheet)
CREATE TABLE IF NOT EXISTS "comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fact_sheet_type" "fact_sheet_type" NOT NULL,
  "fact_sheet_id" uuid NOT NULL,
  "author_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "parent_id" uuid,
  "content" text NOT NULL,
  "mentions" jsonb,
  "edited_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_comments_entity" ON "comments" ("fact_sheet_type", "fact_sheet_id");
CREATE INDEX IF NOT EXISTS "idx_comments_author" ON "comments" ("author_id");
CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments" ("parent_id");

-- Todos (per fact sheet, assignable)
CREATE TABLE IF NOT EXISTS "todos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fact_sheet_type" "fact_sheet_type" NOT NULL,
  "fact_sheet_id" uuid NOT NULL,
  "title" varchar(500) NOT NULL,
  "description" text,
  "assignee_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "done" boolean NOT NULL DEFAULT false,
  "due_date" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_todos_entity" ON "todos" ("fact_sheet_type", "fact_sheet_id");
CREATE INDEX IF NOT EXISTS "idx_todos_assignee" ON "todos" ("assignee_id");
CREATE INDEX IF NOT EXISTS "idx_todos_created_by" ON "todos" ("created_by_id");

-- Surveys
CREATE TABLE IF NOT EXISTS "surveys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(255) NOT NULL,
  "description" text,
  "created_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "fact_sheet_type" "fact_sheet_type",
  "fact_sheet_id" uuid,
  "status" varchar(50) NOT NULL DEFAULT 'draft',
  "closes_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_surveys_creator" ON "surveys" ("created_by_id");
CREATE INDEX IF NOT EXISTS "idx_surveys_entity" ON "surveys" ("fact_sheet_type", "fact_sheet_id");

-- Survey Questions
CREATE TABLE IF NOT EXISTS "survey_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "survey_id" uuid NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
  "question_text" text NOT NULL,
  "question_type" varchar(50) NOT NULL DEFAULT 'text',
  "options" jsonb,
  "target_field" varchar(255),
  "sort_order" integer NOT NULL DEFAULT 0,
  "required" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_survey_questions_survey" ON "survey_questions" ("survey_id");

-- Survey Responses
CREATE TABLE IF NOT EXISTS "survey_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "survey_id" uuid NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES "survey_questions"("id") ON DELETE CASCADE,
  "respondent_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "value" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_survey_responses_survey" ON "survey_responses" ("survey_id");
CREATE INDEX IF NOT EXISTS "idx_survey_responses_respondent" ON "survey_responses" ("respondent_id");

-- Quality Seal Transitions (audit trail for state changes)
CREATE TABLE IF NOT EXISTS "quality_seal_transitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fact_sheet_type" "fact_sheet_type" NOT NULL,
  "fact_sheet_id" uuid NOT NULL,
  "from_state" varchar(50) NOT NULL,
  "to_state" varchar(50) NOT NULL,
  "actor_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_qs_transitions_entity" ON "quality_seal_transitions" ("fact_sheet_type", "fact_sheet_id");
