/**
 * Step 4.5 — Pagination, Sorting, and Filtering Utilities
 *
 * Shared query helpers for all list endpoints:
 *   - Offset pagination (required for >200 records per nfr.md)
 *   - Sort by field with direction
 *   - Filter by field value
 *   - Standard query parameter parsing from URL searchParams
 *
 * All list endpoints in Phase 5+ should use these utilities.
 */

import { z } from "zod";
import type { PaginationMeta } from "@/lib/api-response";
import { asc, desc, eq, ilike, type SQL, type Column } from "drizzle-orm";

// ── Constants ───────────────────────────────────────────────────────────────

/** Default page size. */
export const DEFAULT_PAGE_SIZE = 25;

/** Maximum page size allowed. */
export const MAX_PAGE_SIZE = 200;

/** Default page number. */
export const DEFAULT_PAGE = 1;

// ── Pagination ──────────────────────────────────────────────────────────────

/** Parsed pagination parameters. */
export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

/** Zod schema for pagination query parameters. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

/**
 * Parse pagination parameters from URL searchParams.
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const raw = {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  };

  const parsed = paginationSchema.parse(raw);
  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    offset: (parsed.page - 1) * parsed.pageSize,
  };
}

/**
 * Build pagination metadata from total count and current page.
 */
export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

// ── Sorting ─────────────────────────────────────────────────────────────────

/** Sort direction. */
export type SortDirection = "asc" | "desc";

/** Parsed sort parameters. */
export interface SortParams {
  sortBy: string;
  sortDirection: SortDirection;
}

/** Zod schema for sort query parameters. */
export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Parse sort parameters from URL searchParams.
 */
export function parseSort(searchParams: URLSearchParams): SortParams {
  const raw = {
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortDirection: searchParams.get("sortDirection") ?? undefined,
  };

  return sortSchema.parse(raw);
}

/**
 * Build a Drizzle ORDER BY clause from sort params and a column map.
 *
 * @param sort - Parsed sort parameters
 * @param columnMap - Map of allowed field names to Drizzle columns
 * @returns Drizzle SQL orderBy expression, or undefined if field not found
 *
 * @example
 * const orderBy = buildOrderBy(sort, {
 *   name: table.name,
 *   createdAt: table.createdAt,
 *   health: table.health,
 * });
 */
export function buildOrderBy(sort: SortParams, columnMap: Record<string, Column>): SQL | undefined {
  const column = columnMap[sort.sortBy];
  if (!column) return undefined;

  return sort.sortDirection === "asc" ? asc(column) : desc(column);
}

// ── Filtering ───────────────────────────────────────────────────────────────

/** A single filter condition. */
export interface FilterCondition {
  field: string;
  value: string;
  operator: "eq" | "ilike";
}

/**
 * Parse filter parameters from URL searchParams.
 *
 * Filter format: `filter[field]=value` for exact match,
 * `search[field]=value` for case-insensitive partial match.
 *
 * @example
 * ?filter[lifecycle]=Active&filter[health]=Good&search[name]=SAP
 */
export function parseFilters(searchParams: URLSearchParams): FilterCondition[] {
  const filters: FilterCondition[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    // Exact match: filter[field]=value
    const filterMatch = key.match(/^filter\[(\w+)]$/);
    if (filterMatch) {
      filters.push({ field: filterMatch[1], value, operator: "eq" });
      continue;
    }

    // Partial match: search[field]=value
    const searchMatch = key.match(/^search\[(\w+)]$/);
    if (searchMatch) {
      filters.push({ field: searchMatch[1], value, operator: "ilike" });
    }
  }

  return filters;
}

/**
 * Build Drizzle WHERE conditions from parsed filters and a column map.
 *
 * @param filters - Parsed filter conditions
 * @param columnMap - Map of allowed field names to Drizzle columns
 * @returns Array of Drizzle SQL conditions (combine with `and()`)
 *
 * @example
 * const conditions = buildWhereConditions(filters, {
 *   name: table.name,
 *   lifecycle: table.lifecycle,
 *   health: table.health,
 * });
 * const rows = await db.select().from(table).where(and(...conditions));
 */
export function buildWhereConditions(
  filters: FilterCondition[],
  columnMap: Record<string, Column>
): SQL[] {
  const conditions: SQL[] = [];

  for (const filter of filters) {
    const column = columnMap[filter.field];
    if (!column) continue; // Skip unknown fields silently

    if (filter.operator === "eq") {
      conditions.push(eq(column, filter.value));
    } else if (filter.operator === "ilike") {
      conditions.push(ilike(column, `%${filter.value}%`));
    }
  }

  return conditions;
}

// ── Combined Query Params ───────────────────────────────────────────────────

/** All parsed query parameters for a list endpoint. */
export interface ListQueryParams {
  pagination: PaginationParams;
  sort: SortParams;
  filters: FilterCondition[];
}

/**
 * Parse all list query parameters from a request URL.
 *
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   const url = new URL(req.url);
 *   const query = parseListParams(url.searchParams);
 *   // Use query.pagination, query.sort, query.filters
 * });
 */
export function parseListParams(searchParams: URLSearchParams): ListQueryParams {
  return {
    pagination: parsePagination(searchParams),
    sort: parseSort(searchParams),
    filters: parseFilters(searchParams),
  };
}
