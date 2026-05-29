/**
 * Phase 12.1 — OpenAPI 3.1 Specification Generator
 *
 * Generates a complete OpenAPI 3.1 specification from the VantageMap API
 * route definitions. The spec is served at /api/docs/openapi.json and
 * powers the interactive Swagger UI at /api/docs.
 *
 * This file defines the full API schema declaratively rather than
 * auto-introspecting route handlers (since Next.js doesn't expose route
 * metadata at runtime).
 */

// ── Shared Schema Components ────────────────────────────────────────────────

const FACT_SHEET_TYPES = [
  "BusinessCapability",
  "Organization",
  "BusinessContext",
  "Application",
  "DataObject",
  "Interface",
  "StrategicObjective",
  "Initiative",
  "Platform",
  "TechCategory",
  "ITComponent",
  "Provider",
] as const;

const LIFECYCLE_PHASES = ["Plan", "Phase In", "Active", "Phase Out", "End of Life"] as const;
const HEALTH_STATUSES = ["Good", "Adequate", "Insufficient", "Critical"] as const;
const QUALITY_SEAL_STATES = ["Draft", "Check Needed", "Approved", "Rejected"] as const;
const _SUBSCRIPTION_ROLES = ["Responsible", "Accountable", "Observer"] as const;

// ── OpenAPI Spec ────────────────────────────────────────────────────────────

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "VantageMap API",
    version: "1.0.0",
    description:
      "Enterprise Architecture and Business Strategy Platform API. Manage fact sheets, relationships, governance, and integrations.",
    contact: {
      name: "VantageMap Team",
    },
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: "{baseUrl}",
      description: "VantageMap Server",
      variables: {
        baseUrl: {
          default: "http://localhost:3000",
          description: "Base URL of the VantageMap API",
        },
      },
    },
  ],
  tags: [
    { name: "Applications", description: "Application fact sheet operations" },
    { name: "Capabilities", description: "Business capability operations" },
    { name: "Organizations", description: "Organization operations" },
    { name: "Objectives", description: "Strategic objective operations" },
    { name: "Initiatives", description: "Initiative operations" },
    { name: "IT Components", description: "IT component / Tech Radar operations" },
    { name: "Tech Categories", description: "Technology category operations" },
    { name: "Providers", description: "Provider operations" },
    { name: "Platforms", description: "Platform operations" },
    { name: "Data Objects", description: "Data object operations" },
    { name: "Interfaces", description: "Interface operations" },
    { name: "Relationships", description: "Cross-entity relationship operations" },
    { name: "Search", description: "Full-text search across all entities" },
    { name: "Bulk", description: "Bulk update and delete operations" },
    { name: "Tag Groups", description: "Tag group and tag management" },
    { name: "Governance", description: "Subscriptions, quality seal, comments, todos" },
    { name: "Surveys", description: "Survey creation and response collection" },
    { name: "Webhooks", description: "Webhook subscription management" },
    { name: "Auth", description: "Authentication and session management" },
    { name: "Admin", description: "User and workspace administration" },
    { name: "Health", description: "System health check" },
  ],
  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        operationId: "healthCheck",
        security: [],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Applications ────────────────────────────────────────────────────────
    "/api/applications": {
      get: {
        tags: ["Applications"],
        summary: "List applications",
        operationId: "listApplications",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/PageSizeParam" },
          { $ref: "#/components/parameters/SortParam" },
        ],
        responses: {
          "200": {
            description: "Paginated list of applications",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApplicationListResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Applications"],
        summary: "Create an application",
        operationId: "createApplication",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApplicationCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Application created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApplicationResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/applications/{id}": {
      get: {
        tags: ["Applications"],
        summary: "Get application by ID",
        operationId: "getApplication",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          "200": {
            description: "Application details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApplicationResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Applications"],
        summary: "Update an application",
        operationId: "updateApplication",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApplicationUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Application updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApplicationResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete an application",
        operationId: "deleteApplication",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          "204": { description: "Application deleted" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    // ── Capabilities ────────────────────────────────────────────────────────
    "/api/capabilities": {
      get: {
        tags: ["Capabilities"],
        summary: "List business capabilities",
        operationId: "listCapabilities",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/PageSizeParam" },
          { $ref: "#/components/parameters/SortParam" },
        ],
        responses: {
          "200": { description: "Paginated list of capabilities" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Capabilities"],
        summary: "Create a business capability",
        operationId: "createCapability",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CapabilityCreate" } },
          },
        },
        responses: {
          "201": { description: "Capability created" },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },

    // ── Relationships ───────────────────────────────────────────────────────
    "/api/relationships": {
      get: {
        tags: ["Relationships"],
        summary: "List relationships",
        operationId: "listRelationships",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/PageSizeParam" },
          {
            name: "sourceType",
            in: "query",
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          {
            name: "sourceId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "targetType",
            in: "query",
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          {
            name: "targetId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Paginated list of relationships" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Relationships"],
        summary: "Create a relationship (single or bulk)",
        operationId: "createRelationship",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/RelationshipCreate" },
                  {
                    type: "array",
                    items: { $ref: "#/components/schemas/RelationshipCreate" },
                    maxItems: 100,
                  },
                ],
              },
            },
          },
        },
        responses: {
          "201": { description: "Relationship(s) created" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": { description: "Relationship already exists" },
        },
      },
    },

    // ── Search ──────────────────────────────────────────────────────────────
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Full-text search across all fact sheet types",
        operationId: "searchFactSheets",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 } },
          { name: "type", in: "query", schema: { type: "string", enum: FACT_SHEET_TYPES } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/PageSizeParam" },
        ],
        responses: {
          "200": { description: "Search results with relevance ranking" },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },

    // ── Tag Groups ──────────────────────────────────────────────────────────
    "/api/tag-groups": {
      get: {
        tags: ["Tag Groups"],
        summary: "List tag groups",
        operationId: "listTagGroups",
        responses: { "200": { description: "List of tag groups" } },
      },
      post: {
        tags: ["Tag Groups"],
        summary: "Create a tag group",
        operationId: "createTagGroup",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TagGroupCreate" } },
          },
        },
        responses: { "201": { description: "Tag group created" } },
      },
    },

    // ── Fact Sheet Governance ────────────────────────────────────────────────
    "/api/fact-sheets/{type}/{id}/tags": {
      get: {
        tags: ["Governance"],
        summary: "List tags assigned to a fact sheet",
        operationId: "listFactSheetTags",
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          { $ref: "#/components/parameters/IdParam" },
        ],
        responses: { "200": { description: "Assigned tags" } },
      },
      post: {
        tags: ["Governance"],
        summary: "Assign a tag to a fact sheet",
        operationId: "assignTag",
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          { $ref: "#/components/parameters/IdParam" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { tagId: { type: "string", format: "uuid" } },
                required: ["tagId"],
              },
            },
          },
        },
        responses: { "201": { description: "Tag assigned" } },
      },
    },
    "/api/fact-sheets/{type}/{id}/quality-seal": {
      get: {
        tags: ["Governance"],
        summary: "Get quality seal state and history",
        operationId: "getQualitySeal",
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          { $ref: "#/components/parameters/IdParam" },
        ],
        responses: { "200": { description: "Current state, valid transitions, and history" } },
      },
      post: {
        tags: ["Governance"],
        summary: "Transition quality seal state",
        operationId: "transitionQualitySeal",
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          { $ref: "#/components/parameters/IdParam" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  toState: { type: "string", enum: QUALITY_SEAL_STATES },
                  reason: { type: "string", maxLength: 1000 },
                },
                required: ["toState"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Transition recorded" },
          "403": { description: "Transition not allowed for role" },
        },
      },
    },

    // ── Webhooks ────────────────────────────────────────────────────────────
    "/api/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List webhook subscriptions",
        operationId: "listWebhooks",
        responses: { "200": { description: "List of webhook subscriptions" } },
      },
      post: {
        tags: ["Webhooks"],
        summary: "Create a webhook subscription",
        operationId: "createWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/WebhookCreate" } },
          },
        },
        responses: { "201": { description: "Webhook created" } },
      },
    },

    // ── GraphQL ─────────────────────────────────────────────────────────────
    "/api/graphql": {
      post: {
        tags: ["Search"],
        summary: "GraphQL endpoint for fact sheet queries",
        operationId: "graphqlQuery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: { type: "string" },
                  variables: { type: "object" },
                  operationName: { type: "string" },
                },
                required: ["query"],
              },
            },
          },
        },
        responses: {
          "200": { description: "GraphQL response" },
        },
      },
    },

    // ── Import/Export ────────────────────────────────────────────────────────
    "/api/import": {
      post: {
        tags: ["Bulk"],
        summary: "Import fact sheets from CSV/Excel",
        operationId: "importFactSheets",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                  factSheetType: { type: "string", enum: FACT_SHEET_TYPES },
                  mode: { type: "string", enum: ["preview", "execute"] },
                },
                required: ["file", "factSheetType"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Import preview or result" },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/export": {
      get: {
        tags: ["Bulk"],
        summary: "Export fact sheets to CSV",
        operationId: "exportFactSheets",
        parameters: [
          {
            name: "type",
            in: "query",
            required: true,
            schema: { type: "string", enum: FACT_SHEET_TYPES },
          },
          {
            name: "format",
            in: "query",
            schema: { type: "string", enum: ["csv", "xlsx"], default: "csv" },
          },
          { name: "filter", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "File download",
            content: {
              "text/csv": { schema: { type: "string", format: "binary" } },
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "API Token",
        description: "API token for technical users (prefix: vmap_)",
      },
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description: "Session cookie for browser users",
      },
    },
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
        description: "Page number (1-indexed)",
      },
      PageSizeParam: {
        name: "pageSize",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 200, default: 20 },
        description: "Items per page (max 200)",
      },
      SortParam: {
        name: "sort",
        in: "query",
        schema: { type: "string" },
        description: "Sort field (prefix with - for descending, e.g. -createdAt)",
      },
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Entity UUID",
      },
    },
    responses: {
      BadRequest: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Permission denied",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {
                type: "object",
                additionalProperties: { type: "array", items: { type: "string" } },
              },
              correlationId: { type: "string", format: "uuid" },
            },
            required: ["code", "message", "correlationId"],
          },
        },
        required: ["error"],
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      ApplicationCreate: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          lifecycle: { type: "string", enum: LIFECYCLE_PHASES },
          health: { type: "string", enum: HEALTH_STATUSES },
          qualitySeal: { type: "string", enum: QUALITY_SEAL_STATES },
          owner: { type: "string", maxLength: 255 },
          customFields: { type: "object" },
        },
        required: ["name"],
      },
      ApplicationUpdate: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          lifecycle: { type: "string", enum: LIFECYCLE_PHASES },
          health: { type: "string", enum: HEALTH_STATUSES },
          qualitySeal: { type: "string", enum: QUALITY_SEAL_STATES },
          owner: { type: "string", maxLength: 255 },
          customFields: { type: "object" },
        },
      },
      ApplicationListResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Application" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      ApplicationResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Application" },
        },
      },
      Application: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          lifecycle: { type: "string", enum: LIFECYCLE_PHASES },
          health: { type: "string", enum: HEALTH_STATUSES },
          qualitySeal: { type: "string", enum: QUALITY_SEAL_STATES },
          owner: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CapabilityCreate: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          level: { type: "integer", minimum: 1, maximum: 4 },
          parentId: { type: "string", format: "uuid" },
        },
        required: ["name"],
      },
      RelationshipCreate: {
        type: "object",
        properties: {
          sourceType: { type: "string", enum: FACT_SHEET_TYPES },
          sourceId: { type: "string", format: "uuid" },
          targetType: { type: "string", enum: FACT_SHEET_TYPES },
          targetId: { type: "string", format: "uuid" },
          relationshipType: { type: "string" },
          description: { type: "string" },
          metadata: { type: "object" },
        },
        required: ["sourceType", "sourceId", "targetType", "targetId", "relationshipType"],
      },
      TagGroupCreate: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string" },
          mode: { type: "string", enum: ["on-the-fly", "hybrid", "predefined-only"] },
        },
        required: ["name"],
      },
      WebhookCreate: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          events: { type: "array", items: { type: "string" } },
          secret: { type: "string" },
          active: { type: "boolean", default: true },
        },
        required: ["url", "events"],
      },
    },
  },
  security: [{ BearerAuth: [] }, { CookieAuth: [] }],
} as const;
