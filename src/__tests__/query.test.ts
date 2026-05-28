import { describe, it, expect } from "vitest";
import {
  parsePagination,
  buildPaginationMeta,
  parseSort,
  parseFilters,
  parseListParams,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/query";

// ── Helpers ──────────────────────────────────────────────────────────────────

function params(obj: Record<string, string>): URLSearchParams {
  return new URLSearchParams(obj);
}

// ── Pagination ───────────────────────────────────────────────────────────────

describe("query — parsePagination()", () => {
  it("returns defaults when no params provided", () => {
    const result = parsePagination(new URLSearchParams());
    expect(result.page).toBe(DEFAULT_PAGE);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.offset).toBe(0);
  });

  it("parses explicit page and pageSize", () => {
    const result = parsePagination(params({ page: "3", pageSize: "50" }));
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
    expect(result.offset).toBe(100); // (3-1)*50
  });

  it("computes offset correctly for page 1", () => {
    const result = parsePagination(params({ page: "1", pageSize: "25" }));
    expect(result.offset).toBe(0);
  });

  it("computes offset correctly for page 2", () => {
    const result = parsePagination(params({ page: "2", pageSize: "10" }));
    expect(result.offset).toBe(10);
  });

  it("clamps pageSize to MAX_PAGE_SIZE", () => {
    expect(() => parsePagination(params({ pageSize: String(MAX_PAGE_SIZE + 1) }))).toThrow();
  });

  it("rejects page < 1", () => {
    expect(() => parsePagination(params({ page: "0" }))).toThrow();
  });

  it("rejects pageSize < 1", () => {
    expect(() => parsePagination(params({ pageSize: "0" }))).toThrow();
  });
});

describe("query — buildPaginationMeta()", () => {
  it("calculates totalPages from total and pageSize", () => {
    const meta = buildPaginationMeta(100, { page: 1, pageSize: 25, offset: 0 });
    expect(meta.total).toBe(100);
    expect(meta.totalPages).toBe(4);
    expect(meta.page).toBe(1);
    expect(meta.pageSize).toBe(25);
  });

  it("rounds totalPages up for partial last page", () => {
    const meta = buildPaginationMeta(101, { page: 1, pageSize: 25, offset: 0 });
    expect(meta.totalPages).toBe(5);
  });

  it("returns totalPages of 0 when total is 0", () => {
    const meta = buildPaginationMeta(0, { page: 1, pageSize: 25, offset: 0 });
    expect(meta.totalPages).toBe(0);
  });

  it("returns totalPages of 1 when total equals pageSize", () => {
    const meta = buildPaginationMeta(25, { page: 1, pageSize: 25, offset: 0 });
    expect(meta.totalPages).toBe(1);
  });
});

// ── Sorting ──────────────────────────────────────────────────────────────────

describe("query — parseSort()", () => {
  it("returns defaults when no params provided", () => {
    const result = parseSort(new URLSearchParams());
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortDirection).toBe("desc");
  });

  it("parses explicit sortBy and sortDirection", () => {
    const result = parseSort(params({ sortBy: "name", sortDirection: "asc" }));
    expect(result.sortBy).toBe("name");
    expect(result.sortDirection).toBe("asc");
  });

  it("rejects invalid sortDirection", () => {
    expect(() => parseSort(params({ sortDirection: "random" }))).toThrow();
  });

  it("accepts desc direction", () => {
    const result = parseSort(params({ sortDirection: "desc" }));
    expect(result.sortDirection).toBe("desc");
  });
});

// ── Filtering ────────────────────────────────────────────────────────────────

describe("query — parseFilters()", () => {
  it("returns empty array when no filters provided", () => {
    expect(parseFilters(new URLSearchParams())).toEqual([]);
  });

  it("parses filter[field]=value as eq operator", () => {
    const result = parseFilters(params({ "filter[lifecycle]": "Active" }));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "lifecycle", value: "Active", operator: "eq" });
  });

  it("parses search[field]=value as ilike operator", () => {
    const result = parseFilters(params({ "search[name]": "SAP" }));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "name", value: "SAP", operator: "ilike" });
  });

  it("parses multiple filter conditions", () => {
    const sp = new URLSearchParams();
    sp.set("filter[lifecycle]", "Active");
    sp.set("filter[health]", "Good");
    sp.set("search[name]", "portal");
    const result = parseFilters(sp);
    expect(result).toHaveLength(3);
    const fields = result.map((f) => f.field);
    expect(fields).toContain("lifecycle");
    expect(fields).toContain("health");
    expect(fields).toContain("name");
  });

  it("ignores empty values", () => {
    const sp = new URLSearchParams();
    sp.set("filter[lifecycle]", "");
    const result = parseFilters(sp);
    expect(result).toHaveLength(0);
  });

  it("ignores unrelated params", () => {
    const result = parseFilters(params({ page: "2", sortBy: "name" }));
    expect(result).toHaveLength(0);
  });
});

// ── Combined ─────────────────────────────────────────────────────────────────

describe("query — parseListParams()", () => {
  it("combines pagination, sort, and filters from search params", () => {
    const sp = new URLSearchParams();
    sp.set("page", "2");
    sp.set("pageSize", "10");
    sp.set("sortBy", "name");
    sp.set("sortDirection", "asc");
    sp.set("filter[lifecycle]", "Active");

    const result = parseListParams(sp);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.pageSize).toBe(10);
    expect(result.sort.sortBy).toBe("name");
    expect(result.sort.sortDirection).toBe("asc");
    expect(result.filters).toHaveLength(1);
    expect(result.filters[0].field).toBe("lifecycle");
  });

  it("returns all defaults when no params provided", () => {
    const result = parseListParams(new URLSearchParams());
    expect(result.pagination.page).toBe(DEFAULT_PAGE);
    expect(result.pagination.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.sort.sortBy).toBe("createdAt");
    expect(result.sort.sortDirection).toBe("desc");
    expect(result.filters).toHaveLength(0);
  });
});
