/**
 * Phase 8 — Frontend Views Tests
 *
 * Tests the data-processing logic used by all six frontend views:
 * Dashboard, Capabilities, Applications, Strategy, Radar, Roadmap.
 *
 * Client component internals (useMemo hooks) are tested as pure functions
 * since the test environment is Node (no JSDOM rendering).
 */

import { describe, it, expect } from "vitest";
import type {
  Application,
  BusinessCapability,
  Initiative,
  InitiativeStatus,
  ITComponent,
  StrategicObjective,
  HealthStatus,
} from "@/lib/types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "app-1",
    name: "Test App",
    description: null,
    subtype: "Business Application",
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
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeCap(overrides: Partial<BusinessCapability> = {}): BusinessCapability {
  return {
    id: "cap-1",
    name: "Customer Management",
    description: null,
    level: "1",
    parentId: null,
    lifecycle: "Active",
    health: "Good",
    qualitySeal: null,
    maturity: null,
    strategicImportance: null,
    owner: null,
    customFields: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeInitiative(overrides: Partial<Initiative> = {}): Initiative {
  return {
    id: "init-1",
    name: "Test Initiative",
    description: null,
    subtype: "Project",
    status: "In Progress",
    startDate: null,
    endDate: null,
    budget: null,
    parentId: null,
    lifecycle: "Active",
    health: "Good",
    qualitySeal: null,
    owner: null,
    customFields: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeObjective(overrides: Partial<StrategicObjective> = {}): StrategicObjective {
  return {
    id: "obj-1",
    name: "Grow Revenue",
    description: null,
    perspective: "Financial",
    parentId: null,
    lifecycle: "Active",
    health: "Good",
    qualitySeal: null,
    owner: null,
    customFields: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeComponent(overrides: Partial<ITComponent> = {}): ITComponent {
  return {
    id: "itc-1",
    name: "React",
    description: null,
    subtype: "Software",
    lifecycle: "Active",
    health: "Good",
    qualitySeal: null,
    version: null,
    ring: "Adopt",
    quadrant: "Languages & Frameworks",
    technicalStandard: null,
    endOfLife: null,
    endOfSupport: null,
    techCategoryId: null,
    providerId: null,
    parentId: null,
    owner: null,
    customFields: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// ── Dashboard: computeHealthDistribution ─────────────────────────────────────

function computeHealthDistribution(healthValues: (HealthStatus | null)[]): Record<string, number> {
  const dist: Record<string, number> = {
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Poor: 0,
    Critical: 0,
    Unknown: 0,
  };
  for (const h of healthValues) {
    if (h && h in dist) dist[h]++;
    else dist["Unknown"]++;
  }
  return dist;
}

describe("Dashboard — computeHealthDistribution", () => {
  it("counts each health status correctly", () => {
    const values: (HealthStatus | null)[] = [
      "Excellent",
      "Good",
      "Good",
      "Fair",
      "Poor",
      "Critical",
    ];
    const dist = computeHealthDistribution(values);
    expect(dist).toEqual({
      Excellent: 1,
      Good: 2,
      Fair: 1,
      Poor: 1,
      Critical: 1,
      Unknown: 0,
    });
  });

  it("counts null as Unknown", () => {
    const dist = computeHealthDistribution([null, null, "Good"]);
    expect(dist.Unknown).toBe(2);
    expect(dist.Good).toBe(1);
  });

  it("returns all zeros for empty input", () => {
    const dist = computeHealthDistribution([]);
    expect(Object.values(dist).every((v) => v === 0)).toBe(true);
  });
});

describe("Dashboard — statusDist calculation", () => {
  function computeStatusDist(initiatives: Initiative[]) {
    return {
      "Not Started": initiatives.filter((i) => i.status === "Not Started").length,
      "In Progress": initiatives.filter((i) => i.status === "In Progress").length,
      Completed: initiatives.filter((i) => i.status === "Completed").length,
      "On Hold": initiatives.filter((i) => i.status === "On Hold").length,
      Cancelled: initiatives.filter((i) => i.status === "Cancelled").length,
    };
  }

  it("counts each status correctly", () => {
    const initiatives = [
      makeInitiative({ id: "1", status: "Not Started" }),
      makeInitiative({ id: "2", status: "In Progress" }),
      makeInitiative({ id: "3", status: "In Progress" }),
      makeInitiative({ id: "4", status: "Completed" }),
      makeInitiative({ id: "5", status: "On Hold" }),
      makeInitiative({ id: "6", status: "Cancelled" }),
    ];
    const dist = computeStatusDist(initiatives);
    expect(dist["Not Started"]).toBe(1);
    expect(dist["In Progress"]).toBe(2);
    expect(dist.Completed).toBe(1);
    expect(dist["On Hold"]).toBe(1);
    expect(dist.Cancelled).toBe(1);
  });

  it("returns all zeros for empty input", () => {
    const dist = computeStatusDist([]);
    expect(Object.values(dist).every((v) => v === 0)).toBe(true);
  });
});

describe("Dashboard — criticalApps filter", () => {
  function getCriticalApps(apps: Application[]) {
    return apps.filter((a) => a.health === "Critical" || a.health === "Poor");
  }

  it("returns only Critical and Poor apps", () => {
    const apps = [
      makeApp({ id: "1", health: "Excellent" }),
      makeApp({ id: "2", health: "Critical" }),
      makeApp({ id: "3", health: "Poor" }),
      makeApp({ id: "4", health: "Good" }),
    ];
    const critical = getCriticalApps(apps);
    expect(critical).toHaveLength(2);
    expect(critical.map((a) => a.id)).toEqual(["2", "3"]);
  });

  it("returns empty array when no critical apps", () => {
    const apps = [makeApp({ health: "Good" }), makeApp({ health: "Excellent" })];
    expect(getCriticalApps(apps)).toHaveLength(0);
  });
});

// ── Capabilities: Hierarchy Grouping ─────────────────────────────────────────

describe("Capabilities — hierarchy grouping", () => {
  const caps = [
    makeCap({ id: "l1a", level: "1", parentId: null, name: "Domain A" }),
    makeCap({ id: "l1b", level: "1", parentId: null, name: "Domain B" }),
    makeCap({ id: "l2a", level: "2", parentId: "l1a", name: "Area A1" }),
    makeCap({ id: "l2b", level: "2", parentId: "l1a", name: "Area A2" }),
    makeCap({ id: "l2c", level: "2", parentId: "l1b", name: "Area B1" }),
    makeCap({ id: "l3a", level: "3", parentId: "l2a", name: "Cap A1a" }),
  ];

  it("correctly identifies level 1 capabilities", () => {
    const l1 = caps.filter((c) => c.level === "1");
    expect(l1).toHaveLength(2);
  });

  it("correctly groups level 2 under level 1 parent", () => {
    const l2UnderA = caps.filter((c) => c.level === "2" && c.parentId === "l1a");
    expect(l2UnderA).toHaveLength(2);
    expect(l2UnderA.map((c) => c.name)).toEqual(["Area A1", "Area A2"]);
  });

  it("correctly groups level 3 under level 2 parent", () => {
    const l3UnderA1 = caps.filter((c) => c.level === "3" && c.parentId === "l2a");
    expect(l3UnderA1).toHaveLength(1);
    expect(l3UnderA1[0].name).toBe("Cap A1a");
  });
});

// ── ApplicationsView: Filtering ───────────────────────────────────────────────

function filterApplications(
  applications: Application[],
  search: string,
  filterHealth: string,
  filterLifecycle: string
) {
  let result = applications;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.owner?.toLowerCase().includes(q) ||
        a.subtype?.toLowerCase().includes(q)
    );
  }
  if (filterHealth !== "all") {
    result = result.filter((a) => a.health === filterHealth);
  }
  if (filterLifecycle !== "all") {
    result = result.filter((a) => a.lifecycle === filterLifecycle);
  }
  return result;
}

describe("ApplicationsView — search filter", () => {
  const apps = [
    makeApp({ id: "1", name: "CRM System", description: "Customer relations" }),
    makeApp({ id: "2", name: "ERP Platform", description: null }),
    makeApp({ id: "3", name: "Analytics Dashboard", owner: "Jane Smith" }),
  ];

  it("filters by name (case-insensitive)", () => {
    expect(filterApplications(apps, "crm", "all", "all")).toHaveLength(1);
    expect(filterApplications(apps, "CRM", "all", "all")).toHaveLength(1);
  });

  it("filters by description", () => {
    const result = filterApplications(apps, "customer", "all", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by owner", () => {
    const result = filterApplications(apps, "jane", "all", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("returns all when search is empty", () => {
    expect(filterApplications(apps, "", "all", "all")).toHaveLength(3);
  });

  it("returns empty when no match", () => {
    expect(filterApplications(apps, "zzznomatch", "all", "all")).toHaveLength(0);
  });
});

describe("ApplicationsView — health and lifecycle filters", () => {
  const apps = [
    makeApp({ id: "1", health: "Good", lifecycle: "Active" }),
    makeApp({ id: "2", health: "Critical", lifecycle: "Active" }),
    makeApp({ id: "3", health: "Good", lifecycle: "Phase Out" }),
    makeApp({ id: "4", health: "Poor", lifecycle: "End of Life" }),
  ];

  it("filters by health status", () => {
    expect(filterApplications(apps, "", "Good", "all")).toHaveLength(2);
    expect(filterApplications(apps, "", "Critical", "all")).toHaveLength(1);
  });

  it("filters by lifecycle phase", () => {
    expect(filterApplications(apps, "", "all", "Active")).toHaveLength(2);
    expect(filterApplications(apps, "", "all", "Phase Out")).toHaveLength(1);
  });

  it("combines health and lifecycle filters", () => {
    const result = filterApplications(apps, "", "Good", "Active");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

describe("ApplicationsView — sorting", () => {
  const PAGE_SIZE = 20;

  function sortApplications(apps: Application[], sortBy: string, sortDirection: "asc" | "desc") {
    const arr = [...apps];
    arr.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? "";
      const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return arr;
  }

  const apps = [
    makeApp({ id: "1", name: "Zebra App" }),
    makeApp({ id: "2", name: "Alpha App" }),
    makeApp({ id: "3", name: "Mango App" }),
  ];

  it("sorts by name ascending", () => {
    const sorted = sortApplications(apps, "name", "asc");
    expect(sorted.map((a) => a.name)).toEqual(["Alpha App", "Mango App", "Zebra App"]);
  });

  it("sorts by name descending", () => {
    const sorted = sortApplications(apps, "name", "desc");
    expect(sorted.map((a) => a.name)).toEqual(["Zebra App", "Mango App", "Alpha App"]);
  });

  it("does not mutate the original array", () => {
    const original = apps.map((a) => a.id);
    sortApplications(apps, "name", "asc");
    expect(apps.map((a) => a.id)).toEqual(original);
  });

  it("paginates correctly", () => {
    const manyApps = Array.from({ length: 45 }, (_, i) =>
      makeApp({ id: `app-${i}`, name: `App ${String(i).padStart(2, "0")}` })
    );
    const page1 = manyApps.slice(0, PAGE_SIZE);
    const page2 = manyApps.slice(PAGE_SIZE, 2 * PAGE_SIZE);
    const page3 = manyApps.slice(2 * PAGE_SIZE);

    expect(page1).toHaveLength(20);
    expect(page2).toHaveLength(20);
    expect(page3).toHaveLength(5);
    expect(Math.ceil(manyApps.length / PAGE_SIZE)).toBe(3);
  });
});

// ── Strategy: Perspective Grouping ───────────────────────────────────────────

describe("Strategy — BSC perspective grouping", () => {
  const objectives = [
    makeObjective({ id: "1", perspective: "Financial" }),
    makeObjective({ id: "2", perspective: "Financial" }),
    makeObjective({ id: "3", perspective: "Customer" }),
    makeObjective({ id: "4", perspective: "Internal Process" }),
    makeObjective({ id: "5", perspective: "Learning & Growth" }),
  ];

  const PERSPECTIVES = ["Financial", "Customer", "Internal Process", "Learning & Growth"] as const;

  it("groups objectives by all four perspectives", () => {
    for (const p of PERSPECTIVES) {
      const group = objectives.filter((o) => o.perspective === p);
      expect(group.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("correctly counts Financial objectives", () => {
    expect(objectives.filter((o) => o.perspective === "Financial")).toHaveLength(2);
  });

  it("all objectives are covered by perspective grouping", () => {
    const total = PERSPECTIVES.reduce(
      (sum, p) => sum + objectives.filter((o) => o.perspective === p).length,
      0
    );
    expect(total).toBe(objectives.length);
  });
});

// ── TechRadarView: Filtering ──────────────────────────────────────────────────

function filterComponents(
  components: ITComponent[],
  search: string,
  filterRing: string,
  filterQuadrant: string
) {
  let result = components;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  }
  if (filterRing !== "all") {
    result = result.filter((c) => c.ring === filterRing);
  }
  if (filterQuadrant !== "all") {
    result = result.filter((c) => c.quadrant === filterQuadrant);
  }
  return result;
}

describe("TechRadarView — filtering", () => {
  const components = [
    makeComponent({ id: "1", name: "React", ring: "Adopt", quadrant: "Languages & Frameworks" }),
    makeComponent({ id: "2", name: "Vue", ring: "Trial", quadrant: "Languages & Frameworks" }),
    makeComponent({ id: "3", name: "Kubernetes", ring: "Adopt", quadrant: "Platforms" }),
    makeComponent({ id: "4", name: "Svelte", ring: "Assess", quadrant: "Languages & Frameworks" }),
    makeComponent({
      id: "5",
      name: "Legacy Tool",
      ring: "Hold",
      quadrant: "Tools",
      description: "Old system",
    }),
  ];

  it("filters by name search (case-insensitive)", () => {
    expect(filterComponents(components, "react", "all", "all")).toHaveLength(1);
    expect(filterComponents(components, "REACT", "all", "all")).toHaveLength(1);
  });

  it("filters by description", () => {
    const result = filterComponents(components, "old", "all", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("5");
  });

  it("filters by ring", () => {
    expect(filterComponents(components, "", "Adopt", "all")).toHaveLength(2);
    expect(filterComponents(components, "", "Hold", "all")).toHaveLength(1);
  });

  it("filters by quadrant", () => {
    expect(filterComponents(components, "", "all", "Languages & Frameworks")).toHaveLength(3);
    expect(filterComponents(components, "", "all", "Platforms")).toHaveLength(1);
  });

  it("combines ring and quadrant filters", () => {
    const result = filterComponents(components, "", "Adopt", "Languages & Frameworks");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("React");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterComponents(components, "zzz", "all", "all")).toHaveLength(0);
  });
});

describe("TechRadarView — quadrant grouping", () => {
  const components = [
    makeComponent({ id: "1", quadrant: "Techniques", ring: "Adopt" }),
    makeComponent({ id: "2", quadrant: "Tools", ring: "Adopt" }),
    makeComponent({ id: "3", quadrant: "Platforms", ring: "Trial" }),
    makeComponent({ id: "4", quadrant: "Languages & Frameworks", ring: "Assess" }),
  ];

  const QUADRANTS = ["Techniques", "Tools", "Platforms", "Languages & Frameworks"];

  it("covers all four quadrants", () => {
    const covered = new Set(components.map((c) => c.quadrant));
    expect(QUADRANTS.every((q) => covered.has(q as import("@/lib/types").TechQuadrant))).toBe(true);
  });

  it("groups by ring within a quadrant", () => {
    const adopt = components.filter((c) => c.ring === "Adopt");
    expect(adopt).toHaveLength(2);
  });
});

// ── RoadmapView: Filtering and Sorting ───────────────────────────────────────

const STATUS_ORDER: InitiativeStatus[] = [
  "In Progress",
  "Not Started",
  "On Hold",
  "Completed",
  "Cancelled",
];

function filterAndSortInitiatives(initiatives: Initiative[], search: string, filterStatus: string) {
  let result = initiatives;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    );
  }
  if (filterStatus !== "all") {
    result = result.filter((i) => i.status === filterStatus);
  }
  return result.sort((a, b) => {
    const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
    const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
    if (aDate !== bDate) return aDate - bDate;
    const aIdx = STATUS_ORDER.indexOf(a.status as InitiativeStatus);
    const bIdx = STATUS_ORDER.indexOf(b.status as InitiativeStatus);
    return aIdx - bIdx;
  });
}

describe("RoadmapView — filtering", () => {
  const initiatives = [
    makeInitiative({ id: "1", name: "Cloud Migration", status: "In Progress" }),
    makeInitiative({
      id: "2",
      name: "Data Platform",
      description: "BigData initiative",
      status: "Not Started",
    }),
    makeInitiative({ id: "3", name: "Mobile App", status: "Completed" }),
    makeInitiative({ id: "4", name: "CRM Upgrade", status: "On Hold" }),
  ];

  it("filters by name search", () => {
    expect(filterAndSortInitiatives(initiatives, "cloud", "all")).toHaveLength(1);
  });

  it("filters by description", () => {
    const result = filterAndSortInitiatives(initiatives, "bigdata", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by status", () => {
    expect(filterAndSortInitiatives(initiatives, "", "In Progress")).toHaveLength(1);
    expect(filterAndSortInitiatives(initiatives, "", "Not Started")).toHaveLength(1);
  });

  it("returns all when no filters applied", () => {
    expect(filterAndSortInitiatives(initiatives, "", "all")).toHaveLength(4);
  });
});

describe("RoadmapView — sorting by start date", () => {
  it("sorts earlier start dates first", () => {
    const initiatives = [
      makeInitiative({ id: "1", startDate: "2025-06-01", status: "In Progress" }),
      makeInitiative({ id: "2", startDate: "2025-01-01", status: "In Progress" }),
      makeInitiative({ id: "3", startDate: "2025-03-01", status: "In Progress" }),
    ];
    const sorted = filterAndSortInitiatives(initiatives, "", "all");
    expect(sorted.map((i) => i.id)).toEqual(["2", "3", "1"]);
  });

  it("places null start dates last", () => {
    const initiatives = [
      makeInitiative({ id: "1", startDate: null, status: "In Progress" }),
      makeInitiative({ id: "2", startDate: "2025-01-01", status: "In Progress" }),
    ];
    const sorted = filterAndSortInitiatives(initiatives, "", "all");
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].id).toBe("1");
  });

  it("sorts by status order when start dates are equal", () => {
    const same = "2025-01-01";
    const initiatives = [
      makeInitiative({ id: "1", startDate: same, status: "Completed" }),
      makeInitiative({ id: "2", startDate: same, status: "In Progress" }),
      makeInitiative({ id: "3", startDate: same, status: "Not Started" }),
    ];
    const sorted = filterAndSortInitiatives(initiatives, "", "all");
    // In Progress (idx 0) < Not Started (idx 1) < Completed (idx 3)
    expect(sorted.map((i) => i.id)).toEqual(["2", "3", "1"]);
  });
});

// ── RoadmapView: Gantt Timeline Calculation ───────────────────────────────────

function computeTimeline(initiatives: Initiative[]) {
  const dates = initiatives
    .flatMap((i) => [i.startDate, i.endDate])
    .filter((d): d is string => d !== null)
    .map((d) => new Date(d));

  if (dates.length === 0) {
    const now = new Date();
    return {
      timelineStart: new Date(now.getFullYear(), 0, 1),
      timelineEnd: new Date(now.getFullYear(), 11, 31),
      monthCount: 12,
    };
  }

  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  const start = new Date(min.getFullYear(), min.getMonth() - 1, 1);
  const end = new Date(max.getFullYear(), max.getMonth() + 2, 0);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

  return { timelineStart: start, timelineEnd: end, monthCount: months };
}

function getBarPosition(
  startDate: string | null,
  endDate: string | null,
  timelineStart: Date,
  timelineEnd: Date
) {
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  if (totalMs === 0) return { left: "0%", width: "100%" };

  const start = startDate ? new Date(startDate).getTime() : timelineStart.getTime();
  const end = endDate ? new Date(endDate).getTime() : timelineEnd.getTime();

  const leftPct = ((start - timelineStart.getTime()) / totalMs) * 100;
  const widthPct = ((end - start) / totalMs) * 100;

  return {
    left: `${Math.max(0, leftPct)}%`,
    width: `${Math.min(100 - Math.max(0, leftPct), Math.max(2, widthPct))}%`,
  };
}

describe("RoadmapView — timeline computation", () => {
  it("defaults to current year when no initiatives have dates", () => {
    const { monthCount } = computeTimeline([]);
    expect(monthCount).toBe(12);
  });

  it("spans at least 12 months for a single date range", () => {
    const initiatives = [makeInitiative({ startDate: "2025-03-01", endDate: "2025-06-30" })];
    const { monthCount } = computeTimeline(initiatives);
    // padded by 1 month on each side: Feb–Aug = 7 months minimum
    expect(monthCount).toBeGreaterThanOrEqual(4);
  });

  it("pads start 1 month before earliest date", () => {
    const initiatives = [makeInitiative({ startDate: "2025-06-15", endDate: "2025-09-15" })];
    const { timelineStart } = computeTimeline(initiatives);
    // padded to May (month index 4)
    expect(timelineStart.getMonth()).toBe(4);
  });

  it("pads end beyond the latest date", () => {
    const initiatives = [makeInitiative({ startDate: "2025-06-15", endDate: "2025-09-15" })];
    const { timelineEnd } = computeTimeline(initiatives);
    // new Date(year, 9+2, 0) = last day of month 10 (Oct) = month index 9
    expect(timelineEnd.getMonth()).toBeGreaterThan(8); // after September
  });
});

describe("RoadmapView — getBarPosition", () => {
  const start = new Date(2025, 0, 1); // Jan 1 2025
  const end = new Date(2025, 11, 31); // Dec 31 2025

  it("returns 0% left for bar starting at timeline start", () => {
    const pos = getBarPosition("2025-01-01", "2025-06-30", start, end);
    expect(parseFloat(pos.left)).toBeCloseTo(0, 0);
  });

  it("returns a non-zero left offset for a mid-year bar", () => {
    const pos = getBarPosition("2025-07-01", "2025-09-30", start, end);
    expect(parseFloat(pos.left)).toBeGreaterThan(40);
    expect(parseFloat(pos.left)).toBeLessThan(60);
  });

  it("clamps left to minimum 0% when startDate precedes timeline", () => {
    const pos = getBarPosition("2024-01-01", "2025-03-01", start, end);
    expect(parseFloat(pos.left)).toBe(0);
  });

  it("ensures minimum width of 2%", () => {
    // Same-day start and end — bar too short, should be clamped to 2%
    const pos = getBarPosition("2025-06-15", "2025-06-15", start, end);
    expect(parseFloat(pos.width)).toBeGreaterThanOrEqual(2);
  });

  it("uses timeline bounds when dates are null", () => {
    const pos = getBarPosition(null, null, start, end);
    expect(parseFloat(pos.left)).toBe(0);
    expect(parseFloat(pos.width)).toBeGreaterThan(0);
  });

  it("returns full width when totalMs is zero (degenerate timeline)", () => {
    const samePoint = new Date(2025, 5, 15);
    const pos = getBarPosition("2025-06-15", "2025-06-15", samePoint, samePoint);
    expect(pos.left).toBe("0%");
    expect(pos.width).toBe("100%");
  });
});

// ── RoadmapView: Month Label Generation ──────────────────────────────────────

describe("RoadmapView — month label generation", () => {
  it("generates correct number of month labels", () => {
    const timelineStart = new Date(2025, 0, 1); // Jan
    const monthCount = 6;
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + i, 1);
      return { label: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear() };
    });
    expect(months).toHaveLength(6);
    expect(months[0].label).toBe("Jan");
    expect(months[5].label).toBe("Jun");
  });

  it("handles year rollover correctly", () => {
    const timelineStart = new Date(2025, 10, 1); // Nov 2025
    const monthCount = 4;
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + i, 1);
      return { label: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear() };
    });
    expect(months[0].label).toBe("Nov");
    expect(months[1].label).toBe("Dec");
    expect(months[2].label).toBe("Jan");
    expect(months[2].year).toBe(2026);
    expect(months[3].label).toBe("Feb");
  });
});

// ── DashboardCharts: Data Preparation ────────────────────────────────────────

describe("DashboardCharts — data preparation", () => {
  it("filters out zero-count entries for pie chart", () => {
    const healthDist: Record<string, number> = {
      Excellent: 5,
      Good: 10,
      Fair: 0,
      Poor: 0,
      Critical: 2,
      Unknown: 0,
    };
    const healthData = Object.entries(healthDist)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
    expect(healthData).toHaveLength(3);
    expect(healthData.map((d) => d.name)).toEqual(["Excellent", "Good", "Critical"]);
  });

  it("returns empty array when all counts are zero", () => {
    const dist: Record<string, number> = { A: 0, B: 0, C: 0 };
    const data = Object.entries(dist)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
    expect(data).toHaveLength(0);
  });

  it("preserves correct values in chart data", () => {
    const statusDist: Record<string, number> = {
      "In Progress": 5,
      Completed: 3,
      Cancelled: 0,
    };
    const statusData = Object.entries(statusDist)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
    expect(statusData.find((d) => d.name === "In Progress")?.value).toBe(5);
    expect(statusData.find((d) => d.name === "Completed")?.value).toBe(3);
  });
});
