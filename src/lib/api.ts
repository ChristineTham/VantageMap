/**
 * Step 7.2 — Typed API Client
 *
 * Fetch wrappers for all entity and cross-entity APIs.
 * Used by Server Components to fetch data from the API layer.
 *
 * For MVP, these functions call the local Next.js API routes.
 * In production, the base URL comes from environment variables.
 */

import type {
  BusinessCapability,
  Application,
  StrategicObjective,
  Initiative,
  ITComponent,
  TechCategory,
  Organization,
  DataObject,
  InterfaceEntity,
  Provider,
  Platform,
  Relationship,
} from "@/lib/types";

// ── Types ───────────────────────────────────────────────────────────────────

interface ApiSuccessResponse<T> {
  data: T;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    correlationId: string;
  };
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, string>;
  search?: Record<string, string>;
}

interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  entityType: string;
  lifecycle: string | null;
  health: string | null;
  rank: number;
  headline: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  grouped: { type: string; count: number; results: SearchResult[] }[];
  meta: PaginationMeta;
}

// ── Configuration ───────────────────────────────────────────────────────────

function getBaseUrl(): string {
  // Server-side: use absolute URL
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  }
  // Client-side: use relative path
  return "";
}

// ── Generic Fetch Helpers ───────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
    public correlationId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  // Dev-mode auth bypass
  if (process.env.NODE_ENV === "development" && process.env.DEV_USER_ID) {
    headers["x-dev-user-id"] = process.env.DEV_USER_ID;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json();

  if (!res.ok) {
    const err = body as ApiErrorBody;
    throw new ApiError(
      res.status,
      err.error?.code ?? "UNKNOWN",
      err.error?.message ?? "Unknown error",
      err.error?.details,
      err.error?.correlationId
    );
  }

  return body as T;
}

function buildListUrl(basePath: string, params?: ListParams): string {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortDirection) searchParams.set("sortDirection", params.sortDirection);

  if (params?.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      searchParams.set(`filter[${key}]`, value);
    }
  }

  if (params?.search) {
    for (const [key, value] of Object.entries(params.search)) {
      searchParams.set(`search[${key}]`, value);
    }
  }

  const qs = searchParams.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// ── Generic CRUD Client ─────────────────────────────────────────────────────

function createEntityClient<T>(basePath: string) {
  return {
    async list(params?: ListParams): Promise<ApiListResponse<T>> {
      const url = buildListUrl(basePath, params);
      return apiFetch<ApiListResponse<T>>(url);
    },

    async getById(id: string): Promise<ApiSuccessResponse<T>> {
      return apiFetch<ApiSuccessResponse<T>>(`${basePath}/${id}`);
    },

    async create(data: Partial<T>): Promise<ApiSuccessResponse<T>> {
      return apiFetch<ApiSuccessResponse<T>>(basePath, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<T>): Promise<ApiSuccessResponse<T>> {
      return apiFetch<ApiSuccessResponse<T>>(`${basePath}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    async remove(id: string): Promise<void> {
      await apiFetch<void>(`${basePath}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

// ── Entity Clients ──────────────────────────────────────────────────────────

export const capabilitiesApi = createEntityClient<BusinessCapability>("/api/capabilities");
export const applicationsApi = createEntityClient<Application>("/api/applications");
export const objectivesApi = createEntityClient<StrategicObjective>("/api/objectives");
export const initiativesApi = createEntityClient<Initiative>("/api/initiatives");
export const itComponentsApi = createEntityClient<ITComponent>("/api/it-components");
export const techCategoriesApi = createEntityClient<TechCategory>("/api/tech-categories");
export const organizationsApi = createEntityClient<Organization>("/api/organizations");
export const dataObjectsApi = createEntityClient<DataObject>("/api/data-objects");
export const interfacesApi = createEntityClient<InterfaceEntity>("/api/interfaces");
export const providersApi = createEntityClient<Provider>("/api/providers");
export const platformsApi = createEntityClient<Platform>("/api/platforms");
export const relationshipsApi = createEntityClient<Relationship>("/api/relationships");

// ── Search API ──────────────────────────────────────────────────────────────

export async function searchEntities(
  query: string,
  options?: { types?: string[]; page?: number; pageSize?: number }
): Promise<ApiSuccessResponse<SearchResponse>> {
  const params = new URLSearchParams({ q: query });
  if (options?.types?.length) params.set("types", options.types.join(","));
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("pageSize", String(options.pageSize));

  return apiFetch<ApiSuccessResponse<SearchResponse>>(`/api/search?${params}`);
}

// ── Facets API ──────────────────────────────────────────────────────────────

export async function getFacets(
  types?: string[]
): Promise<
  ApiSuccessResponse<{ facets: { field: string; values: { value: string; count: number }[] }[] }>
> {
  const params = new URLSearchParams();
  if (types?.length) params.set("types", types.join(","));
  const qs = params.toString();
  return apiFetch(`/api/facets${qs ? `?${qs}` : ""}`);
}

export async function filterByFacets(
  params: Record<string, string>
): Promise<ApiSuccessResponse<{ results: unknown[]; meta: PaginationMeta }>> {
  const searchParams = new URLSearchParams(params);
  return apiFetch(`/api/facets/filter?${searchParams}`);
}

// ── Bulk API ────────────────────────────────────────────────────────────────

export async function bulkUpdate(payload: {
  entities: { id: string; type: string }[];
  fields?: Record<string, string>;
  addTags?: string[];
  removeTags?: string[];
}): Promise<ApiSuccessResponse<{ updated: number; results: unknown[] }>> {
  return apiFetch("/api/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function bulkDelete(
  entities: { id: string; type: string }[]
): Promise<ApiSuccessResponse<{ deleted: number; results: unknown[] }>> {
  return apiFetch("/api/bulk?action=delete", {
    method: "POST",
    body: JSON.stringify({ entities }),
  });
}

export async function bulkUpsert(
  items: {
    type: string;
    name: string;
    description?: string;
    lifecycle?: string;
    health?: string;
    owner?: string;
  }[]
): Promise<
  ApiSuccessResponse<{ processed: number; created: number; updated: number; results: unknown[] }>
> {
  return apiFetch("/api/bulk?action=upsert", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ── Re-export error type ────────────────────────────────────────────────────

export { ApiError };
