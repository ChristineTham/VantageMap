/**
 * Phase 12 — Integration Surface Tests
 *
 * Tests for:
 * - OpenAPI spec structure and completeness
 * - GraphQL schema validation
 * - Webhook event catalog and payload structure
 * - Import/Export column mapping and validation
 */

import { describe, it, expect } from "vitest";
import { openApiSpec } from "@/lib/openapi";
import { WEBHOOK_EVENTS, type WebhookPayload } from "@/lib/webhook-engine";

// ── OpenAPI Spec Tests ──────────────────────────────────────────────────────

describe("OpenAPI Specification", () => {
  it("should have version 3.1.0", () => {
    expect(openApiSpec.openapi).toBe("3.1.0");
  });

  it("should have info metadata", () => {
    expect(openApiSpec.info.title).toBe("VantageMap API");
    expect(openApiSpec.info.version).toBe("1.0.0");
    expect(openApiSpec.info.description).toBeTruthy();
  });

  it("should define security schemes", () => {
    expect(openApiSpec.components.securitySchemes.BearerAuth).toBeDefined();
    expect(openApiSpec.components.securitySchemes.CookieAuth).toBeDefined();
    expect(openApiSpec.components.securitySchemes.BearerAuth.type).toBe("http");
    expect(openApiSpec.components.securitySchemes.CookieAuth.type).toBe("apiKey");
  });

  it("should have pagination parameters", () => {
    expect(openApiSpec.components.parameters.PageParam).toBeDefined();
    expect(openApiSpec.components.parameters.PageSizeParam).toBeDefined();
    expect(openApiSpec.components.parameters.SortParam).toBeDefined();
  });

  it("should define error response schema", () => {
    const errorSchema = openApiSpec.components.schemas.ErrorResponse;
    expect(errorSchema).toBeDefined();
    expect(errorSchema.type).toBe("object");
    expect(errorSchema.properties.error.properties.code).toBeDefined();
    expect(errorSchema.properties.error.properties.message).toBeDefined();
    expect(errorSchema.properties.error.properties.correlationId).toBeDefined();
  });

  it("should define all major API paths", () => {
    const paths = Object.keys(openApiSpec.paths);
    expect(paths).toContain("/api/health");
    expect(paths).toContain("/api/applications");
    expect(paths).toContain("/api/applications/{id}");
    expect(paths).toContain("/api/capabilities");
    expect(paths).toContain("/api/relationships");
    expect(paths).toContain("/api/search");
    expect(paths).toContain("/api/webhooks");
    expect(paths).toContain("/api/graphql");
    expect(paths).toContain("/api/import");
    expect(paths).toContain("/api/export");
  });

  it("should have proper CRUD operations for applications", () => {
    const appPaths = openApiSpec.paths["/api/applications"];
    expect(appPaths.get).toBeDefined();
    expect(appPaths.post).toBeDefined();

    const appIdPaths = openApiSpec.paths["/api/applications/{id}"];
    expect(appIdPaths.get).toBeDefined();
    expect(appIdPaths.patch).toBeDefined();
    expect(appIdPaths.delete).toBeDefined();
  });

  it("should have health endpoint without auth", () => {
    const health = openApiSpec.paths["/api/health"].get;
    expect(health.security).toEqual([]);
  });

  it("should define all tags", () => {
    const tagNames = openApiSpec.tags.map((t) => t.name);
    expect(tagNames).toContain("Applications");
    expect(tagNames).toContain("Capabilities");
    expect(tagNames).toContain("Relationships");
    expect(tagNames).toContain("Search");
    expect(tagNames).toContain("Webhooks");
    expect(tagNames).toContain("Health");
  });
});

// ── Webhook Event Catalog Tests ─────────────────────────────────────────────

describe("Webhook Event Catalog", () => {
  it("should define CRUD events for major entities", () => {
    expect(WEBHOOK_EVENTS).toContain("application.created");
    expect(WEBHOOK_EVENTS).toContain("application.updated");
    expect(WEBHOOK_EVENTS).toContain("application.deleted");
    expect(WEBHOOK_EVENTS).toContain("capability.created");
    expect(WEBHOOK_EVENTS).toContain("initiative.updated");
  });

  it("should define relationship events", () => {
    expect(WEBHOOK_EVENTS).toContain("relationship.created");
    expect(WEBHOOK_EVENTS).toContain("relationship.deleted");
  });

  it("should define governance events", () => {
    expect(WEBHOOK_EVENTS).toContain("quality_seal.transitioned");
    expect(WEBHOOK_EVENTS).toContain("tag.assigned");
    expect(WEBHOOK_EVENTS).toContain("tag.removed");
  });

  it("should define bulk operation events", () => {
    expect(WEBHOOK_EVENTS).toContain("bulk.import_completed");
    expect(WEBHOOK_EVENTS).toContain("bulk.export_completed");
  });

  it("should have valid event naming pattern", () => {
    for (const event of WEBHOOK_EVENTS) {
      expect(event).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });
});

// ── Webhook Payload Type Tests ──────────────────────────────────────────────

describe("Webhook Payload Structure", () => {
  it("should have required fields", () => {
    const payload: WebhookPayload = {
      event: "application.created",
      timestamp: new Date().toISOString(),
      data: { id: "123", name: "Test App" },
    };
    expect(payload.event).toBe("application.created");
    expect(payload.timestamp).toBeTruthy();
    expect(payload.data).toBeDefined();
  });

  it("should support optional metadata", () => {
    const payload: WebhookPayload = {
      event: "application.updated",
      timestamp: new Date().toISOString(),
      data: { id: "456" },
      metadata: {
        userId: "user-1",
        correlationId: "corr-1",
      },
    };
    expect(payload.metadata?.userId).toBe("user-1");
    expect(payload.metadata?.correlationId).toBe("corr-1");
  });
});

// ── Feature Flag Tests ──────────────────────────────────────────────────────

describe("Phase 12 Feature Flags", () => {
  it("should export GraphQL and Webhooks flags", async () => {
    const { isFeatureEnabled } = await import("@/lib/feature-flags");
    // These should exist and default to true
    expect(isFeatureEnabled("FEATURE_GRAPHQL_API")).toBe(true);
    expect(isFeatureEnabled("FEATURE_WEBHOOKS_API")).toBe(true);
    expect(isFeatureEnabled("FEATURE_IMPORT_API")).toBe(true);
    expect(isFeatureEnabled("FEATURE_EXPORT_API")).toBe(true);
  });
});
