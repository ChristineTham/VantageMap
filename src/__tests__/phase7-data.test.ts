/**
 * Phase 7 — data.ts tests
 *
 * Verifies the unified data-access layer: feature-flag gating,
 * successful API delegation, and silent fallback to [] / null
 * when the API throws.
 *
 * The API client module is fully mocked so no real HTTP calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock the API client before importing data.ts ──────────────────────────────

vi.mock("@/lib/api", () => ({
  capabilitiesApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
  applicationsApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
  objectivesApi: { list: vi.fn() },
  initiativesApi: { list: vi.fn() },
  itComponentsApi: { list: vi.fn() },
  techCategoriesApi: { list: vi.fn() },
  organizationsApi: { list: vi.fn() },
  dataObjectsApi: { list: vi.fn() },
  interfacesApi: { list: vi.fn() },
  providersApi: { list: vi.fn() },
  platformsApi: { list: vi.fn() },
}));

import {
  getCapabilities,
  getCapability,
  getApplications,
  getApplication,
  getObjectives,
  getInitiatives,
  getITComponents,
  getTechCategories,
  getOrganizations,
  getDataObjects,
  getInterfaces,
  getProviders,
  getPlatforms,
  type BusinessCapability,
  type Application,
} from "@/lib/data";

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
} from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function withEnv(key: string, value: string | undefined, fn: () => void) {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

// A minimal fixture that satisfies the BusinessCapability shape
const capFixture: BusinessCapability = {
  id: "cap-1",
  name: "Customer Management",
  description: null,
  level: "1",
  parentId: null,
  lifecycle: "Active",
  health: "Good",
  qualitySeal: "Approved",
  maturity: null,
  strategicImportance: null,
  owner: null,
  customFields: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const appFixture: Application = {
  id: "app-1",
  name: "CRM System",
  description: null,
  subtype: null,
  lifecycle: "Active",
  health: "Good",
  qualitySeal: null,
  technicalFit: null,
  functionalFit: null,
  businessCriticality: null,
  timeClassification: null,
  sixRClassification: null,
  version: null,
  parentId: null,
  owner: null,
  customFields: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getCapabilities() ─────────────────────────────────────────────────────────

describe("getCapabilities()", () => {
  it("returns data from the API when the flag is enabled (default)", async () => {
    vi.mocked(capabilitiesApi.list).mockResolvedValueOnce({
      data: [capFixture],
      meta: { page: 1, pageSize: 200, total: 1, totalPages: 1 },
    });

    const result = await getCapabilities();
    expect(result).toEqual([capFixture]);
    expect(capabilitiesApi.list).toHaveBeenCalledOnce();
  });

  it("passes default sort params to the API", async () => {
    vi.mocked(capabilitiesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });

    await getCapabilities();
    expect(capabilitiesApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 200, sortBy: "name", sortDirection: "asc" })
    );
  });

  it("merges caller params (override defaults)", async () => {
    vi.mocked(capabilitiesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    });

    await getCapabilities({ pageSize: 10, sortBy: "createdAt" });
    expect(capabilitiesApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 10, sortBy: "createdAt" })
    );
  });

  it("returns [] when the API throws", async () => {
    vi.mocked(capabilitiesApi.list).mockRejectedValueOnce(new Error("Network error"));
    const result = await getCapabilities();
    expect(result).toEqual([]);
  });

  it("returns [] when FEATURE_CAPABILITIES_API is disabled", async () => {
    await withEnv("FEATURE_CAPABILITIES_API", "false", async () => {
      const result = await getCapabilities();
      expect(result).toEqual([]);
      expect(capabilitiesApi.list).not.toHaveBeenCalled();
    });
  });
});

// ── getCapability() ───────────────────────────────────────────────────────────

describe("getCapability()", () => {
  it("returns a single entity from the API", async () => {
    vi.mocked(capabilitiesApi.getById).mockResolvedValueOnce({ data: capFixture });
    const result = await getCapability("cap-1");
    expect(result).toEqual(capFixture);
    expect(capabilitiesApi.getById).toHaveBeenCalledWith("cap-1");
  });

  it("returns null when the API throws", async () => {
    vi.mocked(capabilitiesApi.getById).mockRejectedValueOnce(new Error("Not found"));
    const result = await getCapability("cap-missing");
    expect(result).toBeNull();
  });

  it("returns null when FEATURE_CAPABILITIES_API is disabled", async () => {
    await withEnv("FEATURE_CAPABILITIES_API", "false", async () => {
      const result = await getCapability("cap-1");
      expect(result).toBeNull();
      expect(capabilitiesApi.getById).not.toHaveBeenCalled();
    });
  });
});

// ── getApplications() ─────────────────────────────────────────────────────────

describe("getApplications()", () => {
  it("returns data from the API", async () => {
    vi.mocked(applicationsApi.list).mockResolvedValueOnce({
      data: [appFixture],
      meta: { page: 1, pageSize: 200, total: 1, totalPages: 1 },
    });

    const result = await getApplications();
    expect(result).toEqual([appFixture]);
  });

  it("returns [] when the API throws", async () => {
    vi.mocked(applicationsApi.list).mockRejectedValueOnce(new Error("Timeout"));
    expect(await getApplications()).toEqual([]);
  });

  it("returns [] when FEATURE_APPLICATIONS_API is disabled", async () => {
    await withEnv("FEATURE_APPLICATIONS_API", "false", async () => {
      expect(await getApplications()).toEqual([]);
      expect(applicationsApi.list).not.toHaveBeenCalled();
    });
  });
});

// ── getApplication() ──────────────────────────────────────────────────────────

describe("getApplication()", () => {
  it("returns a single application", async () => {
    vi.mocked(applicationsApi.getById).mockResolvedValueOnce({ data: appFixture });
    const result = await getApplication("app-1");
    expect(result).toEqual(appFixture);
  });

  it("returns null when the API throws", async () => {
    vi.mocked(applicationsApi.getById).mockRejectedValueOnce(new Error("Not found"));
    expect(await getApplication("missing")).toBeNull();
  });
});

// ── getObjectives() — strategy feature flag ───────────────────────────────────

describe("getObjectives()", () => {
  it("delegates to objectivesApi.list()", async () => {
    vi.mocked(objectivesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    const result = await getObjectives();
    expect(result).toEqual([]);
    expect(objectivesApi.list).toHaveBeenCalledOnce();
  });

  it("returns [] when FEATURE_STRATEGY_API is disabled", async () => {
    await withEnv("FEATURE_STRATEGY_API", "false", async () => {
      expect(await getObjectives()).toEqual([]);
      expect(objectivesApi.list).not.toHaveBeenCalled();
    });
  });

  it("returns [] when the API throws", async () => {
    vi.mocked(objectivesApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getObjectives()).toEqual([]);
  });
});

// ── getInitiatives() — roadmap feature flag ──────────────────────────────────

describe("getInitiatives()", () => {
  it("delegates to initiativesApi.list()", async () => {
    vi.mocked(initiativesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getInitiatives()).toEqual([]);
    expect(initiativesApi.list).toHaveBeenCalledOnce();
  });

  it("returns [] when FEATURE_ROADMAP_API is disabled", async () => {
    await withEnv("FEATURE_ROADMAP_API", "false", async () => {
      expect(await getInitiatives()).toEqual([]);
      expect(initiativesApi.list).not.toHaveBeenCalled();
    });
  });
});

// ── getITComponents() — radar feature flag ────────────────────────────────────

describe("getITComponents()", () => {
  it("delegates to itComponentsApi.list()", async () => {
    vi.mocked(itComponentsApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getITComponents()).toEqual([]);
  });

  it("returns [] when FEATURE_RADAR_API is disabled", async () => {
    await withEnv("FEATURE_RADAR_API", "false", async () => {
      expect(await getITComponents()).toEqual([]);
      expect(itComponentsApi.list).not.toHaveBeenCalled();
    });
  });
});

// ── getTechCategories() ───────────────────────────────────────────────────────

describe("getTechCategories()", () => {
  it("delegates to techCategoriesApi.list()", async () => {
    vi.mocked(techCategoriesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getTechCategories()).toEqual([]);
  });

  it("returns [] when FEATURE_RADAR_API is disabled", async () => {
    await withEnv("FEATURE_RADAR_API", "false", async () => {
      expect(await getTechCategories()).toEqual([]);
      expect(techCategoriesApi.list).not.toHaveBeenCalled();
    });
  });
});

// ── getOrganizations() — no feature-flag gate ─────────────────────────────────

describe("getOrganizations()", () => {
  it("delegates to organizationsApi.list()", async () => {
    vi.mocked(organizationsApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getOrganizations()).toEqual([]);
    expect(organizationsApi.list).toHaveBeenCalledOnce();
  });

  it("returns [] when the API throws", async () => {
    vi.mocked(organizationsApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getOrganizations()).toEqual([]);
  });
});

// ── getDataObjects(), getInterfaces(), getProviders(), getPlatforms() ─────────

describe("getDataObjects()", () => {
  it("delegates to dataObjectsApi.list()", async () => {
    vi.mocked(dataObjectsApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getDataObjects()).toEqual([]);
  });

  it("returns [] on error", async () => {
    vi.mocked(dataObjectsApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getDataObjects()).toEqual([]);
  });
});

describe("getInterfaces()", () => {
  it("delegates to interfacesApi.list()", async () => {
    vi.mocked(interfacesApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getInterfaces()).toEqual([]);
  });

  it("returns [] on error", async () => {
    vi.mocked(interfacesApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getInterfaces()).toEqual([]);
  });
});

describe("getProviders()", () => {
  it("delegates to providersApi.list()", async () => {
    vi.mocked(providersApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getProviders()).toEqual([]);
  });

  it("returns [] on error", async () => {
    vi.mocked(providersApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getProviders()).toEqual([]);
  });
});

describe("getPlatforms()", () => {
  it("delegates to platformsApi.list()", async () => {
    vi.mocked(platformsApi.list).mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 200, total: 0, totalPages: 0 },
    });
    expect(await getPlatforms()).toEqual([]);
  });

  it("returns [] on error", async () => {
    vi.mocked(platformsApi.list).mockRejectedValueOnce(new Error("err"));
    expect(await getPlatforms()).toEqual([]);
  });
});
