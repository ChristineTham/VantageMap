CREATE TYPE "public"."application_subtype" AS ENUM('Business Application', 'Microservice', 'AI Agent');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."business_context_subtype" AS ENUM('Business Product', 'Customer Journey', 'Process', 'Value Stream', 'ESG Capability');--> statement-breakpoint
CREATE TYPE "public"."business_criticality" AS ENUM('Administrative Service', 'Relevant', 'Important', 'Mission Critical');--> statement-breakpoint
CREATE TYPE "public"."capability_level" AS ENUM('1', '2', '3');--> statement-breakpoint
CREATE TYPE "public"."data_flow_direction" AS ENUM('Incoming', 'Outgoing', 'Bi-Directional');--> statement-breakpoint
CREATE TYPE "public"."fact_sheet_type" AS ENUM('BusinessCapability', 'Organization', 'BusinessContext', 'Application', 'DataObject', 'Interface', 'StrategicObjective', 'Initiative', 'Platform', 'TechCategory', 'ITComponent', 'Provider');--> statement-breakpoint
CREATE TYPE "public"."fit_score" AS ENUM('Insufficient', 'Adequate', 'Full');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('Excellent', 'Good', 'Fair', 'Poor', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."initiative_status" AS ENUM('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."initiative_subtype" AS ENUM('Idea', 'Program', 'Project', 'Epic');--> statement-breakpoint
CREATE TYPE "public"."interface_subtype" AS ENUM('Logical Interface', 'API', 'MCP Server');--> statement-breakpoint
CREATE TYPE "public"."it_component_subtype" AS ENUM('Hardware', 'IaaS', 'PaaS', 'SaaS', 'Service', 'Software', 'AI Model');--> statement-breakpoint
CREATE TYPE "public"."lifecycle_phase" AS ENUM('Plan', 'Phase In', 'Active', 'Phase Out', 'End of Life');--> statement-breakpoint
CREATE TYPE "public"."organization_subtype" AS ENUM('Business Unit', 'Customer', 'Region', 'Legal Entity', 'Team');--> statement-breakpoint
CREATE TYPE "public"."quality_seal" AS ENUM('Draft', 'Check Needed', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('supports', 'supported by', 'used by', 'uses', 'used in', 'provides', 'consumes', 'processes', 'manages', 'runs on', 'depends on', 'belongs to', 'contains', 'in scope of', 'impacts', 'improves', 'drives', 'linked to', 'related to', 'performed by', 'assigned to', 'owns', 'owned by', 'offered by', 'classified in', 'classifies', 'implements', 'implemented via', 'transfers', 'transferred via', 'involved in', 'requires', 'required by', 'parent', 'child');--> statement-breakpoint
CREATE TYPE "public"."six_r_classification" AS ENUM('Retire', 'Retain', 'Repurchase', 'Rehost', 'Replatform', 'Rearchitect');--> statement-breakpoint
CREATE TYPE "public"."standard_role" AS ENUM('Viewer', 'Member', 'Admin');--> statement-breakpoint
CREATE TYPE "public"."strategic_perspective" AS ENUM('Financial', 'Customer', 'Internal Process', 'Learning & Growth');--> statement-breakpoint
CREATE TYPE "public"."subscription_role" AS ENUM('Responsible', 'Accountable', 'Observer');--> statement-breakpoint
CREATE TYPE "public"."tag_mode" AS ENUM('on-the-fly', 'hybrid', 'predefined-only');--> statement-breakpoint
CREATE TYPE "public"."tech_quadrant" AS ENUM('Techniques', 'Tools', 'Platforms', 'Languages & Frameworks');--> statement-breakpoint
CREATE TYPE "public"."tech_ring" AS ENUM('Adopt', 'Trial', 'Assess', 'Hold');--> statement-breakpoint
CREATE TYPE "public"."technical_standard" AS ENUM('Approved', 'Approved with constraints', 'Deprecated');--> statement-breakpoint
CREATE TYPE "public"."time_classification" AS ENUM('Tolerate', 'Invest', 'Migrate', 'Eliminate');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('Active', 'Invited', 'Requested', 'Not Invited', 'Archived');--> statement-breakpoint
CREATE TABLE "business_capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"level" "capability_level" DEFAULT '1' NOT NULL,
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"maturity" integer,
	"strategic_importance" integer,
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_contexts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "business_context_subtype" DEFAULT 'Process' NOT NULL,
	"level" integer DEFAULT 1,
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "organization_subtype" DEFAULT 'Business Unit' NOT NULL,
	"level" integer DEFAULT 1,
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "application_subtype",
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"technical_fit" "fit_score",
	"functional_fit" "fit_score",
	"business_criticality" "business_criticality",
	"time_classification" time_classification,
	"six_r_classification" "six_r_classification",
	"version" varchar(100),
	"parent_id" uuid,
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"data_classification" varchar(100),
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interfaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "interface_subtype" DEFAULT 'Logical Interface',
	"data_flow_direction" "data_flow_direction",
	"frequency" varchar(100),
	"provider_application_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"endpoint_url" varchar(2048),
	"auth_protocol" varchar(100),
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "initiative_subtype" DEFAULT 'Project',
	"status" "initiative_status" DEFAULT 'Not Started',
	"start_date" date,
	"end_date" date,
	"budget" numeric,
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"objective_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"target_value" numeric,
	"current_value" numeric,
	"unit" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategic_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"perspective" "strategic_perspective" NOT NULL,
	"parent_id" uuid,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "it_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subtype" "it_component_subtype",
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"version" varchar(100),
	"technical_standard" "technical_standard",
	"ring" "tech_ring",
	"quadrant" "tech_quadrant",
	"end_of_life" date,
	"end_of_support" date,
	"tech_category_id" uuid,
	"provider_id" uuid,
	"parent_id" uuid,
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"lifecycle" "lifecycle_phase" DEFAULT 'Active',
	"health" "health_status" DEFAULT 'Good',
	"quality_seal" "quality_seal" DEFAULT 'Draft',
	"location" varchar(255),
	"contact_info" text,
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tech_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"level" integer DEFAULT 1,
	"parent_id" uuid,
	"owner" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" "fact_sheet_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"target_type" "fact_sheet_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_relationships_edge" UNIQUE("source_type","source_id","target_type","target_id","relationship_type")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"fact_sheet_type" "fact_sheet_type" NOT NULL,
	"fact_sheet_id" uuid NOT NULL,
	"role" "subscription_role" DEFAULT 'Observer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_subscription" UNIQUE("user_id","fact_sheet_type","fact_sheet_id","role")
);
--> statement-breakpoint
CREATE TABLE "tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"fact_sheet_type" "fact_sheet_type" NOT NULL,
	"fact_sheet_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tag_assignment" UNIQUE("tag_id","fact_sheet_type","fact_sheet_id")
);
--> statement-breakpoint
CREATE TABLE "tag_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"mode" "tag_mode" DEFAULT 'on-the-fly' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tag_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_group_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tag_group_name" UNIQUE("tag_group_id","name")
);
--> statement-breakpoint
CREATE TABLE "audit_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_type" varchar(50) DEFAULT 'user' NOT NULL,
	"actor_display_name" varchar(255),
	"action" "audit_action" NOT NULL,
	"target_type" "fact_sheet_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"target_display_name" varchar(255),
	"diff" jsonb,
	"request_context" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_workspace_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" "standard_role" DEFAULT 'Viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_workspace" UNIQUE("user_id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" varchar(2048),
	"status" "user_status" DEFAULT 'Invited' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_objective_id_strategic_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."strategic_objectives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_tag_group_id_tag_groups_id_fk" FOREIGN KEY ("tag_group_id") REFERENCES "public"."tag_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workspace_roles" ADD CONSTRAINT "user_workspace_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workspace_roles" ADD CONSTRAINT "user_workspace_roles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_relationships_source" ON "relationships" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_target" ON "relationships" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_type" ON "relationships" USING btree ("relationship_type");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_entity" ON "subscriptions" USING btree ("fact_sheet_type","fact_sheet_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tag_assignments_entity" ON "tag_assignments" USING btree ("fact_sheet_type","fact_sheet_id");--> statement-breakpoint
CREATE INDEX "idx_audit_target" ON "audit_entries" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_entries" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_entries" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_created_at" ON "audit_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_actor_time" ON "audit_entries" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_uwr_user" ON "user_workspace_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_uwr_workspace" ON "user_workspace_roles" USING btree ("workspace_id");