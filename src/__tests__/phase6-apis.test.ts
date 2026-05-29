/**
 * Phase 6 — Relationship, Search, Facet, and Bulk API Tests
 *
 * Tests for route handlers:
 *   - GET/POST /api/relationships
 *   - GET/PATCH/DELETE /api/relationships/[id]
 *   - GET /api/search
 *   - GET /api/facets
 *   - GET /api/facets/filter
 *   - POST /api/bulk
 *
 * All database calls are intercepted via vi.mock so no real DB is needed.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { AuthContext } from "@/lib/auth";

// ─── Mocks (must precede module imports) ───────────────────────────────────

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/rbac", () => ({
  requirePermission: vi.fn().mockReturnValue({ ok: true }),
}));

vi.mock("@/lib/feature-flags", () => ({
  isFeatureEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
  computeDiff: vi.fn().mockReturnValue(undefined),
}));

// ─── Module imports (after mocks) ──────────────────────────────────────────

import { db } from "@/db";
import { requireAuth } from "@/lib/auth";
import { GET as relListGET, POST as relPOST } from "@/app/api/relationships/route";
import {
  GET as relIdGET,
  PATCH as relPATCH,
  DELETE as relDELETE,
} from "@/app/api/relationships/[id]/route";
import { GET as searchGET } from "@/app/api/search/route";
import { GET as facetsGET } from "@/app/api/facets/route";
import { GET as facetsFilterGET } from "@/app/api/facets/filter/route";
import { POST as bulkPOST } from "@/app/api/bulk/route";

// ─── Fixtures ──────────────────────────────────────────────────────────────

const VALID_UUID = "12345678-1234-4234-8234-123456789012";
const OTHER_UUID = "aaaabbbb-1234-4aaa-8bbb-ffffaaaabbbb";

const sampleRelationship = {
  id: VALID_UUID,
  sourceType: "Application",
  sourceId: OTHER_UUID,
  targetType: "BusinessCapability",
  targetId: "ccccdddd-1234-4fff-aaaa-bbbbccccdddd",
  relationshipType: "supports",
  description: null,
  metadata: null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

// ─── Auth helpers ──────────────────────────────────────────────────────────

function authFor(role: AuthContext["role"] = "Admin") {
  return {
    ok: true as const,
    auth: {
      userId: "u1",
      email: "test@example.com",
      name: "Test User",
      role,
      workspaceId: "ws1",
    } satisfies AuthContext,
  };
}

function unauthResult() {
  return {
    ok: false as const,
    response: NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required", correlationId: "x" } },
      { status: 401 }
    ),
  };
}

// ─── DB chain helpers ──────────────────────────────────────────────────────

function selectChain(result: unknown[]) {
  const chain: Record<string, unknown> = {};
  for (const m of ["from", "where", "limit", "offset", "orderBy"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(res, rej);
  chain.catch = (rej: (e: unknown) => unknown) => Promise.resolve(result).catch(rej);
  chain.finally = (fin: () => void) => Promise.resolve(result).finally(fin);
  return chain;
}

function insertChain(result: unknown[]) {
  const returning = vi.fn().mockResolvedValue(result);
  const onConflictDoNothing = vi.fn().mockReturnValue({ returning });
  const values = vi.fn().mockReturnValue({ returning, onConflictDoNothing });
  return { values };
}

function updateChain(result: unknown[]) {
  const inner: Record<string, unknown> = {};
  inner.returning = vi.fn().mockResolvedValue(result);
  inner.where = vi.fn().mockReturnValue(inner);
  return { set: vi.fn().mockReturnValue(inner) };
}

function deleteChain() {
  const chain: Record<string, unknown> = {};
  chain.where = vi.fn().mockReturnValue(chain);
  chain.then = (res: () => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve(undefined).then(res, rej);
  chain.catch = (rej: (e: unknown) => unknown) => Promise.resolve(undefined).catch(rej);
  chain.finally = (fin: () => void) => Promise.resolve(undefined).finally(fin);
  return chain;
}

// ─── Request helpers ───────────────────────────────────────────────────────

const BASE = "http://localhost:3000";

function makeRequest(url: string, method = "GET", body?: unknown) {
  const opts: RequestInit = { method };
  if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  return new Request(url, opts) as unknown as NextRequest;
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ══════════════════════════════════════════════════════════════════════════════
// Relationship Collection (GET/POST /api/relationships)
// ══════════════════════════════════════════════════════════════════════════════

describe("GET /api/relationships", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await relListGET(makeRequest(`${BASE}/api/relationships`));
    expect(res.status).toBe(401);
  });

  it("returns list of relationships with pagination meta", async () => {
    // First call: count, second call: rows
    let dbCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      dbCallCount++;
      if (dbCallCount === 1) return selectChain([{ value: 1 }]) as never;
      return selectChain([sampleRelationship]) as never;
    });

    const res = await relListGET(makeRequest(`${BASE}/api/relationships`));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBe(1);
  });

  it("filters by sourceType query param", async () => {
    let dbCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      dbCallCount++;
      if (dbCallCount === 1) return selectChain([{ value: 1 }]) as never;
      return selectChain([sampleRelationship]) as never;
    });

    const res = await relListGET(
      makeRequest(`${BASE}/api/relationships?sourceType=Application&sourceId=${OTHER_UUID}`)
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/relationships — single create", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.insert).mockReturnValue(insertChain([sampleRelationship]) as never);
  });

  it("creates a valid relationship", async () => {
    const body = {
      sourceType: "Application",
      sourceId: OTHER_UUID,
      targetType: "BusinessCapability",
      targetId: "ccccdddd-1234-4fff-aaaa-bbbbccccdddd",
      relationshipType: "supports",
    };
    const res = await relPOST(makeRequest(`${BASE}/api/relationships`, "POST", body));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data).toBeDefined();
  });

  it("returns 400 for invalid relationship type pair", async () => {
    const body = {
      sourceType: "Provider",
      sourceId: VALID_UUID,
      targetType: "Application",
      targetId: OTHER_UUID,
      relationshipType: "supports", // Provider → Application via 'supports' is not in the model
    };
    const res = await relPOST(makeRequest(`${BASE}/api/relationships`, "POST", body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toMatch(/not allowed/i);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request(`${BASE}/api/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    }) as unknown as NextRequest;
    const res = await relPOST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing required fields", async () => {
    const res = await relPOST(
      makeRequest(`${BASE}/api/relationships`, "POST", { sourceType: "Application" })
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/relationships — bulk create", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.insert).mockReturnValue(insertChain([sampleRelationship]) as never);
  });

  it("bulk creates valid relationships", async () => {
    const body = [
      {
        sourceType: "Application",
        sourceId: OTHER_UUID,
        targetType: "BusinessCapability",
        targetId: "ccccdddd-1234-4fff-aaaa-bbbbccccdddd",
        relationshipType: "supports",
      },
      {
        sourceType: "Initiative",
        sourceId: VALID_UUID,
        targetType: "StrategicObjective",
        targetId: "ddddeeee-1234-4aaa-8bbb-ccccddddeeee",
        relationshipType: "supports",
      },
    ];
    const res = await relPOST(makeRequest(`${BASE}/api/relationships`, "POST", body));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeInstanceOf(Array);
  });

  it("returns 400 if any bulk item has an invalid pair", async () => {
    const body = [
      {
        sourceType: "Provider",
        sourceId: VALID_UUID,
        targetType: "Application",
        targetId: OTHER_UUID,
        relationshipType: "supports", // invalid
      },
    ];
    const res = await relPOST(makeRequest(`${BASE}/api/relationships`, "POST", body));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty array", async () => {
    const res = await relPOST(makeRequest(`${BASE}/api/relationships`, "POST", []));
    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Relationship Individual (GET/PATCH/DELETE /api/relationships/[id])
// ══════════════════════════════════════════════════════════════════════════════

describe("GET /api/relationships/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await relIdGET(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(401);
  });

  it("returns the relationship when found", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([sampleRelationship]) as never);
    const res = await relIdGET(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`),
      ctx(VALID_UUID)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.id).toBe(VALID_UUID);
  });

  it("returns 404 when not found", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([]) as never);
    const res = await relIdGET(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await relIdGET(
      makeRequest(`${BASE}/api/relationships/not-a-uuid`),
      ctx("not-a-uuid")
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/relationships/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.select).mockReturnValue(selectChain([sampleRelationship]) as never);
  });

  it("updates description and metadata", async () => {
    vi.mocked(db.update).mockReturnValue(
      updateChain([{ ...sampleRelationship, description: "Updated" }]) as never
    );
    const res = await relPATCH(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`, "PATCH", {
        description: "Updated",
        metadata: { cost: 5000 },
      }),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.description).toBe("Updated");
  });

  it("returns 404 when relationship not found", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([]) as never);
    const res = await relPATCH(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`, "PATCH", { description: "x" }),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await relPATCH(
      makeRequest(`${BASE}/api/relationships/invalid`, "PATCH", { description: "x" }),
      ctx("invalid")
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/relationships/[id]", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.select).mockReturnValue(selectChain([sampleRelationship]) as never);
    vi.mocked(db.delete).mockReturnValue(deleteChain() as never);
  });

  it("deletes the relationship and returns 204", async () => {
    const res = await relDELETE(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`, "DELETE"),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(204);
  });

  it("returns 404 when relationship not found", async () => {
    vi.mocked(db.select).mockReturnValue(selectChain([]) as never);
    const res = await relDELETE(
      makeRequest(`${BASE}/api/relationships/${VALID_UUID}`, "DELETE"),
      ctx(VALID_UUID)
    );
    expect(res.status).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Search API (GET /api/search)
// ══════════════════════════════════════════════════════════════════════════════

describe("GET /api/search", () => {
  const searchRows = [
    {
      id: VALID_UUID,
      name: "Customer Management",
      description: "Manage customer data",
      entity_type: "Application",
      lifecycle: "Active",
      health: "Good",
      rank: 0.9,
      headline: "<mark>Customer</mark> Management",
    },
  ];

  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ total: "1" }] } as never)
      .mockResolvedValueOnce({ rows: searchRows } as never);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=customer`));
    expect(res.status).toBe(401);
  });

  it("returns 400 when q is missing", async () => {
    const res = await searchGET(makeRequest(`${BASE}/api/search`));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toMatch(/required/i);
  });

  it("returns 400 when q is empty", async () => {
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=`));
    expect(res.status).toBe(400);
  });

  it("returns 400 when q exceeds 500 characters", async () => {
    const longQuery = "a".repeat(501);
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=${longQuery}`));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toMatch(/too long/i);
  });

  it("returns 400 for invalid entity types", async () => {
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=test&types=FakeType`));
    expect(res.status).toBe(400);
  });

  it("returns search results with query and grouped fields", async () => {
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=customer`));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.query).toBe("customer");
    expect(body.data.results).toBeInstanceOf(Array);
    expect(body.data.grouped).toBeInstanceOf(Array);
    expect(body.data.meta).toBeDefined();
  });

  it("respects type filter", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ total: "1" }] } as never)
      .mockResolvedValueOnce({ rows: searchRows } as never);
    const res = await searchGET(makeRequest(`${BASE}/api/search?q=customer&types=Application`));
    expect(res.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Facets API (GET /api/facets)
// ══════════════════════════════════════════════════════════════════════════════

describe("GET /api/facets", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await facetsGET(makeRequest(`${BASE}/api/facets`));
    expect(res.status).toBe(401);
  });

  it("returns facet groups", async () => {
    vi.mocked(db.execute).mockResolvedValue({
      rows: [{ value: "Application", count: 5 }],
    } as never);
    const res = await facetsGET(makeRequest(`${BASE}/api/facets`));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.facets).toBeInstanceOf(Array);
  });

  it("returns 400 for invalid type filter", async () => {
    const res = await facetsGET(makeRequest(`${BASE}/api/facets?types=InvalidType`));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toMatch(/invalid entity types/i);
  });

  it("accepts valid types filter", async () => {
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
    const res = await facetsGET(makeRequest(`${BASE}/api/facets?types=Application,ITComponent`));
    expect(res.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Faceted Filter API (GET /api/facets/filter)
// ══════════════════════════════════════════════════════════════════════════════

describe("GET /api/facets/filter", () => {
  const filterRows = [
    {
      id: VALID_UUID,
      name: "Customer App",
      description: null,
      entity_type: "Application",
      lifecycle: "Active",
      health: "Good",
      quality_seal: null,
      owner: null,
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ total: 1 }] } as never)
      .mockResolvedValueOnce({ rows: filterRows } as never);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await facetsFilterGET(makeRequest(`${BASE}/api/facets/filter?types=Application`));
    expect(res.status).toBe(401);
  });

  it("returns 400 when types param is missing", async () => {
    const res = await facetsFilterGET(makeRequest(`${BASE}/api/facets/filter`));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toMatch(/types.*required/i);
  });

  it("returns 400 for invalid types", async () => {
    const res = await facetsFilterGET(makeRequest(`${BASE}/api/facets/filter?types=FakeType`));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid sortBy field", async () => {
    const res = await facetsFilterGET(
      makeRequest(`${BASE}/api/facets/filter?types=Application&sortBy=hack`)
    );
    expect(res.status).toBe(400);
  });

  it("returns filtered results with pagination", async () => {
    const res = await facetsFilterGET(
      makeRequest(`${BASE}/api/facets/filter?types=Application&lifecycle=Active`)
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.results).toBeInstanceOf(Array);
    expect(body.data.meta).toBeDefined();
    expect(body.data.meta.total).toBe(1);
  });

  it("accepts multiple types and lifecycle values", async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ rows: [{ total: 0 }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const res = await facetsFilterGET(
      makeRequest(
        `${BASE}/api/facets/filter?types=Application,ITComponent&lifecycle=Active,Phase%20In`
      )
    );
    expect(res.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Bulk API (POST /api/bulk)
// ══════════════════════════════════════════════════════════════════════════════

describe("POST /api/bulk — update (default)", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
    vi.mocked(db.insert).mockReturnValue(insertChain([]) as never);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(unauthResult());
    const res = await bulkPOST(makeRequest(`${BASE}/api/bulk`, "POST", { entities: [] }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const res = await bulkPOST(makeRequest(`${BASE}/api/bulk`, "POST", { entities: "bad" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when entities array is empty", async () => {
    const res = await bulkPOST(makeRequest(`${BASE}/api/bulk`, "POST", { entities: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown entity type", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk`, "POST", {
        entities: [{ id: VALID_UUID, type: "UnknownType" }],
        fields: { lifecycle: "Active" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("bulk updates lifecycle for valid entities", async () => {
    vi.mocked(db.execute).mockResolvedValue({ rows: [{ id: VALID_UUID }] } as never);
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk`, "POST", {
        entities: [
          { id: VALID_UUID, type: "Application" },
          { id: OTHER_UUID, type: "Application" },
        ],
        fields: { lifecycle: "Phase Out" },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.updated).toBeGreaterThanOrEqual(0);
  });

  it("bulk adds tags to entities", async () => {
    const tagId = "eeeeeeee-1234-4aaa-8bbb-ccccddddeeee";
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk`, "POST", {
        entities: [{ id: VALID_UUID, type: "Application" }],
        addTags: [tagId],
      })
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/bulk?action=delete", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute).mockResolvedValue({ rows: [{ id: VALID_UUID }] } as never);
  });

  it("bulk deletes entities", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk?action=delete`, "POST", {
        entities: [{ id: VALID_UUID, type: "Application" }],
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.deleted).toBeGreaterThanOrEqual(0);
  });

  it("returns 400 for empty entities array", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk?action=delete`, "POST", { entities: [] })
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/bulk?action=upsert", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue(authFor());
    vi.mocked(db.execute).mockResolvedValue({ rows: [] } as never);
  });

  it("bulk upserts items by name", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk?action=upsert`, "POST", {
        items: [
          { type: "Application", name: "New App", lifecycle: "Active" },
          { type: "Application", name: "Existing App", description: "Updated via upsert" },
        ],
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.processed).toBeGreaterThanOrEqual(0);
  });

  it("returns 400 for empty items array", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk?action=upsert`, "POST", { items: [] })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid item type", async () => {
    const res = await bulkPOST(
      makeRequest(`${BASE}/api/bulk?action=upsert`, "POST", {
        items: [{ type: "FakeType", name: "Test" }],
      })
    );
    expect(res.status).toBe(400);
  });
});
