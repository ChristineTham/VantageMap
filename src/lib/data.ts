/**
 * Step 7.2 — Data Layer
 *
 * Unified data access for all frontend components.
 * Supports toggling between API-backed data and static fixtures
 * via feature flags, per migration-plan.md.
 *
 * Usage in Server Components:
 *   import { getCapabilities, getApplications } from "@/lib/data";
 *   const caps = await getCapabilities();
 */

import {
  capabilitiesApi,
  applicationsApi,
  objectivesApi,
  initiativesApi,
  itComponentsApi,
  techCategoriesApi,
  organizationsApi,
  dataObjectsApi,
  interfacesApi,
  providersApi,
  platformsApi,
  relationshipsApi,
  searchEntities,
  type ListParams,
} from "@/lib/api";

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
  FactSheetType,
} from "@/lib/types";

// Re-export types and colour maps for convenience
export * from "@/lib/types";

// ── Feature Flag Check ──────────────────────────────────────────────────────

function isApiEnabled(flag: string): boolean {
  const value = process.env[flag];
  if (value === undefined) return true; // default enabled
  return value === "true" || value === "1" || value === "yes";
}

// ── Data Access Functions ───────────────────────────────────────────────────

/**
 * Fetch business capabilities.
 * Returns all capabilities when no params provided (pageSize=200).
 */
export async function getCapabilities(params?: ListParams): Promise<BusinessCapability[]> {
  if (!isApiEnabled("FEATURE_CAPABILITIES_API")) return [];
  try {
    const res = await capabilitiesApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch a single capability by ID.
 */
export async function getCapability(id: string): Promise<BusinessCapability | null> {
  if (!isApiEnabled("FEATURE_CAPABILITIES_API")) return null;
  try {
    const res = await capabilitiesApi.getById(id);
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Fetch applications.
 */
export async function getApplications(params?: ListParams): Promise<Application[]> {
  if (!isApiEnabled("FEATURE_APPLICATIONS_API")) return [];
  try {
    const res = await applicationsApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch a single application by ID.
 */
export async function getApplication(id: string): Promise<Application | null> {
  if (!isApiEnabled("FEATURE_APPLICATIONS_API")) return null;
  try {
    const res = await applicationsApi.getById(id);
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Fetch strategic objectives.
 */
export async function getObjectives(params?: ListParams): Promise<StrategicObjective[]> {
  if (!isApiEnabled("FEATURE_STRATEGY_API")) return [];
  try {
    const res = await objectivesApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch initiatives.
 */
export async function getInitiatives(params?: ListParams): Promise<Initiative[]> {
  if (!isApiEnabled("FEATURE_ROADMAP_API")) return [];
  try {
    const res = await initiativesApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch IT components (tech radar entries).
 */
export async function getITComponents(params?: ListParams): Promise<ITComponent[]> {
  if (!isApiEnabled("FEATURE_RADAR_API")) return [];
  try {
    const res = await itComponentsApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch tech categories.
 */
export async function getTechCategories(params?: ListParams): Promise<TechCategory[]> {
  if (!isApiEnabled("FEATURE_RADAR_API")) return [];
  try {
    const res = await techCategoriesApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch organizations.
 */
export async function getOrganizations(params?: ListParams): Promise<Organization[]> {
  try {
    const res = await organizationsApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch data objects.
 */
export async function getDataObjects(params?: ListParams): Promise<DataObject[]> {
  try {
    const res = await dataObjectsApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch interfaces.
 */
export async function getInterfaces(params?: ListParams): Promise<InterfaceEntity[]> {
  try {
    const res = await interfacesApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch providers.
 */
export async function getProviders(params?: ListParams): Promise<Provider[]> {
  try {
    const res = await providersApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Fetch platforms.
 */
export async function getPlatforms(params?: ListParams): Promise<Platform[]> {
  try {
    const res = await platformsApi.list({
      pageSize: 200,
      sortBy: "name",
      sortDirection: "asc",
      ...params,
    });
    return res.data;
  } catch {
    return [];
  }
}

// ── Relationship Data Access ────────────────────────────────────────────────

/**
 * Fetch relationships for a specific entity (as source or target).
 */
export async function getRelationshipsForEntity(
  entityType: FactSheetType,
  entityId: string
): Promise<Relationship[]> {
  try {
    const [asSource, asTarget] = await Promise.all([
      relationshipsApi.list({
        pageSize: 200,
        filters: { sourceType: entityType, sourceId: entityId },
      }),
      relationshipsApi.list({
        pageSize: 200,
        filters: { targetType: entityType, targetId: entityId },
      }),
    ]);
    return [...asSource.data, ...asTarget.data];
  } catch {
    return [];
  }
}

// ── Generic Entity Lookup ───────────────────────────────────────────────────

/**
 * Fetch any fact sheet by type and ID.
 * Returns the entity record or null if not found.
 */
export async function getEntityByTypeAndId(
  type: FactSheetType,
  id: string
): Promise<Record<string, unknown> | null> {
  try {
    const apiClientMap: Record<FactSheetType, { getById: (id: string) => Promise<{ data: unknown }> }> = {
      BusinessCapability: capabilitiesApi,
      Application: applicationsApi,
      StrategicObjective: objectivesApi,
      Initiative: initiativesApi,
      ITComponent: itComponentsApi,
      TechCategory: techCategoriesApi,
      Organization: organizationsApi,
      DataObject: dataObjectsApi,
      Interface: interfacesApi,
      Provider: providersApi,
      Platform: platformsApi,
      BusinessContext: { getById: async () => ({ data: null }) },
    };

    const client = apiClientMap[type];
    if (!client) return null;

    const res = await client.getById(id);
    return res.data as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

// ── Search ──────────────────────────────────────────────────────────────────

/**
 * Perform a cross-entity search.
 */
export async function searchAllEntities(
  query: string,
  options?: { types?: string[]; page?: number; pageSize?: number }
) {
  try {
    const res = await searchEntities(query, options);
    return res.data;
  } catch {
    return { query, results: [], grouped: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }
}
