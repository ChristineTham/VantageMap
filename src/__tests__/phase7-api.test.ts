/**
 * Phase 7 — api.ts tests
 *
 * Tests the typed API client: ApiError class, URL building via entity
 * clients, fetch-level behaviour (success, error, 204 no-content),
 * and cross-entity helpers (search, facets, bulk).
 *
 * fetch is stubbed with vi.stubGlobal so no real network calls are made.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ApiError,
  capabilitiesApi,
  applicationsApi,
  searchEntities,
  getFacets,
  filterByFacets,
  bulkUpdate,
  bulkDelete,
  bulkUpsert,
  type ListParams,
} from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function make204Response(): Response {
  return new Response(null, { status: 204 });
}

// ── Setup ────────────────────────────────────────────────────────────────────

let fetchMock: ReturnType<typeof vi.fn>;

// In Node environment, getBaseUrl() returns NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'.
// Set it to an empty string so relative paths are used (matching client-side behaviour).
beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "";
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_API_URL;
  vi.unstubAllGlobals();
});

// ── ApiError ─────────────────────────────────────────────────────────────────

describe("ApiError", () => {
  it("sets name to 'ApiError'", () => {
    const err = new ApiError(404, "NOT_FOUND", "Not found");
    expect(err.name).toBe("ApiError");
  });

  it("inherits from Error", () => {
    const err = new ApiError(500, "SERVER_ERROR", "Internal error");
    expect(err).toBeInstanceOf(Error);
  });

  it("stores status, code, and message", () => {
    const err = new ApiError(422, "VALIDATION_ERROR", "Invalid input", { name: ["required"] });
    expect(err.status).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Invalid input");
    expect(err.details).toEqual({ name: ["required"] });
  });

  it("stores optional correlationId", () => {
    const err = new ApiError(500, "ERR", "msg", undefined, "corr-123");
    expect(err.correlationId).toBe("corr-123");
  });

  it("accepts undefined details and correlationId", () => {
    const err = new ApiError(400, "BAD_REQUEST", "Bad");
    expect(err.details).toBeUndefined();
    expect(err.correlationId).toBeUndefined();
  });
});

// ── Entity client — list() ───────────────────────────────────────────────────

describe("capabilitiesApi.list()", () => {
  it("calls /api/capabilities with no params", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await capabilitiesApi.list();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/capabilities");
    expect(url).not.toContain("?");
  });

  it("appends page and pageSize to the query string", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await capabilitiesApi.list({ page: 2, pageSize: 50 });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=50");
  });

  it("appends sortBy and sortDirection", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await capabilitiesApi.list({ sortBy: "name", sortDirection: "desc" });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("sortBy=name");
    expect(url).toContain("sortDirection=desc");
  });

  it("appends filter params as filter[key]=value", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await capabilitiesApi.list({ filters: { lifecycle: "Active", health: "Good" } });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("filter%5Blifecycle%5D=Active");
    expect(url).toContain("filter%5Bhealth%5D=Good");
  });

  it("returns the parsed response body", async () => {
    const payload = {
      data: [{ id: "1", name: "Capability A" }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };
    fetchMock.mockResolvedValueOnce(makeJsonResponse(payload));
    const result = await capabilitiesApi.list();
    expect(result).toEqual(payload);
  });

  it("throws ApiError when the server returns 4xx", async () => {
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse(
        { error: { code: "NOT_FOUND", message: "No such entity", correlationId: "c1" } },
        404
      )
    );
    await expect(capabilitiesApi.list()).rejects.toBeInstanceOf(ApiError);
  });

  it("populates ApiError fields from the response body", async () => {
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "Bad input",
            details: { name: ["required"] },
            correlationId: "corr-abc",
          },
        },
        422
      )
    );
    let thrown: ApiError | undefined;
    try {
      await capabilitiesApi.list();
    } catch (e) {
      thrown = e as ApiError;
    }
    expect(thrown?.status).toBe(422);
    expect(thrown?.code).toBe("VALIDATION_FAILED");
    expect(thrown?.message).toBe("Bad input");
    expect(thrown?.correlationId).toBe("corr-abc");
  });
});

// ── Entity client — getById() ─────────────────────────────────────────────────

describe("capabilitiesApi.getById()", () => {
  it("calls /api/capabilities/:id", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { id: "abc" } }));
    await capabilitiesApi.getById("abc");
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/capabilities/abc");
  });

  it("returns the parsed response", async () => {
    const payload = { data: { id: "xyz", name: "Capability X" } };
    fetchMock.mockResolvedValueOnce(makeJsonResponse(payload));
    const result = await capabilitiesApi.getById("xyz");
    expect(result).toEqual(payload);
  });
});

// ── Entity client — create() ──────────────────────────────────────────────────

describe("capabilitiesApi.create()", () => {
  it("sends a POST request", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { id: "new" } }));
    await capabilitiesApi.create({ name: "New Capability" });
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/capabilities");
    expect(options.method).toBe("POST");
  });

  it("serialises the body to JSON", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { id: "new" } }));
    await capabilitiesApi.create({ name: "Test" });
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBe(JSON.stringify({ name: "Test" }));
  });
});

// ── Entity client — update() ──────────────────────────────────────────────────

describe("capabilitiesApi.update()", () => {
  it("sends a PATCH request to /api/capabilities/:id", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { id: "cap1" } }));
    await capabilitiesApi.update("cap1", { name: "Updated" });
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/capabilities/cap1");
    expect(options.method).toBe("PATCH");
  });
});

// ── Entity client — remove() ──────────────────────────────────────────────────

describe("capabilitiesApi.remove()", () => {
  it("sends a DELETE request to /api/capabilities/:id", async () => {
    fetchMock.mockResolvedValueOnce(make204Response());
    await capabilitiesApi.remove("cap1");
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/capabilities/cap1");
    expect(options.method).toBe("DELETE");
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(make204Response());
    const result = await capabilitiesApi.remove("cap1");
    expect(result).toBeUndefined();
  });
});

// ── Applications client (separate base path) ─────────────────────────────────

describe("applicationsApi.list()", () => {
  it("calls /api/applications", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await applicationsApi.list();
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/applications");
    expect(url).not.toContain("?");
  });
});

// ── searchEntities() ──────────────────────────────────────────────────────────

describe("searchEntities()", () => {
  it("calls /api/search with q param", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { results: [] } }));
    await searchEntities("customer portal");
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/search");
    expect(url).toContain("q=customer+portal");
  });

  it("includes types param when provided", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { results: [] } }));
    await searchEntities("portal", { types: ["Application", "ITComponent"] });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("types=Application%2CITComponent");
  });

  it("includes page and pageSize params", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { results: [] } }));
    await searchEntities("test", { page: 2, pageSize: 10 });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=10");
  });
});

// ── getFacets() ────────────────────────────────────────────────────────────────

describe("getFacets()", () => {
  it("calls /api/facets with no params when types is undefined", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { facets: [] } }));
    await getFacets();
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toBe("/api/facets");
  });

  it("includes types param when provided", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { facets: [] } }));
    await getFacets(["Application", "DataObject"]);
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("types=Application%2CDataObject");
  });
});

// ── filterByFacets() ──────────────────────────────────────────────────────────

describe("filterByFacets()", () => {
  it("calls /api/facets/filter with serialised params", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { results: [], meta: {} } }));
    await filterByFacets({ lifecycle: "Active", type: "Application" });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/facets/filter");
    expect(url).toContain("lifecycle=Active");
    expect(url).toContain("type=Application");
  });
});

// ── bulkUpdate() ──────────────────────────────────────────────────────────────

describe("bulkUpdate()", () => {
  it("sends POST to /api/bulk with entities payload", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { updated: 1, results: [] } }));
    await bulkUpdate({
      entities: [{ id: "cap-1", type: "BusinessCapability" }],
      fields: { lifecycle: "Active" },
    });
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/bulk");
    expect(url).not.toContain("action=");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body as string) as unknown;
    expect(body).toMatchObject({
      entities: [{ id: "cap-1", type: "BusinessCapability" }],
      fields: { lifecycle: "Active" },
    });
  });
});

// ── bulkDelete() ──────────────────────────────────────────────────────────────

describe("bulkDelete()", () => {
  it("sends POST to /api/bulk?action=delete", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: { deleted: 2, results: [] } }));
    const entities = [
      { id: "cap-1", type: "BusinessCapability" },
      { id: "cap-2", type: "BusinessCapability" },
    ];
    await bulkDelete(entities);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/bulk");
    expect(url).toContain("action=delete");
    expect(options.method).toBe("POST");
  });
});

// ── bulkUpsert() ──────────────────────────────────────────────────────────────

describe("bulkUpsert()", () => {
  it("sends POST to /api/bulk?action=upsert with items array", async () => {
    fetchMock.mockResolvedValueOnce(
      makeJsonResponse({ data: { processed: 1, created: 1, updated: 0, results: [] } })
    );
    await bulkUpsert([{ type: "BusinessCapability", name: "New Cap" }]);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/bulk");
    expect(url).toContain("action=upsert");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body as string) as unknown;
    expect(body).toMatchObject({ items: [{ type: "BusinessCapability", name: "New Cap" }] });
  });
});

// ── No params list URL ────────────────────────────────────────────────────────

describe("buildListUrl — edge cases via entity client", () => {
  it("omits page=0 (falsy value skipped)", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    const params: ListParams = { page: 0, pageSize: 10 };
    await capabilitiesApi.list(params);
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    // page=0 is falsy — should not appear
    expect(url).not.toContain("page=");
    expect(url).toContain("pageSize=10");
  });

  it("handles search params", async () => {
    fetchMock.mockResolvedValueOnce(makeJsonResponse({ data: [], meta: {} }));
    await capabilitiesApi.list({ search: { name: "portal" } });
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("search%5Bname%5D=portal");
  });
});
