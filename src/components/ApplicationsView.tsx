"use client";

import { useState, useMemo } from "react";
import type { Application, HealthStatus, LifecyclePhase } from "@/lib/types";
import { healthBg, lifecycleColour } from "@/lib/types";
import { DataTable, useTableSort, type Column } from "@/components/DataTable";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge, HealthBadge } from "@/components/StatusBadge";
import { LifecycleTag } from "@/components/LifecycleTag";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 20;

interface ApplicationsViewProps {
  applications: Application[];
}

export function ApplicationsView({ applications }: ApplicationsViewProps) {
  const [search, setSearch] = useState("");
  const [filterHealth, setFilterHealth] = useState<string>("all");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { sortBy, sortDirection, toggleSort } = useTableSort("name");

  // Filter
  const filtered = useMemo(() => {
    let result = applications;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }

    if (filterHealth !== "all") {
      result = result.filter((a) => a.health === filterHealth);
    }

    if (filterLifecycle !== "all") {
      result = result.filter((a) => a.lifecycle === filterLifecycle);
    }

    return result;
  }, [applications, search, filterHealth, filterLifecycle]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortBy] ?? "";
      const bVal = (b as Record<string, unknown>)[sortBy] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortBy, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns: Column<Application>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-rosely-night">{row.name}</span>
      ),
    },
    {
      key: "health",
      header: "Health",
      sortable: true,
      render: (row) => <HealthBadge health={row.health} />,
      className: "w-28",
    },
    {
      key: "lifecycle",
      header: "Lifecycle",
      sortable: true,
      render: (row) => <LifecycleTag lifecycle={row.lifecycle} />,
      className: "w-28",
    },
    {
      key: "businessCriticality",
      header: "Criticality",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-rosely-dusk">
          {row.businessCriticality || "—"}
        </span>
      ),
      className: "w-32",
    },
    {
      key: "timeClassification",
      header: "TIME",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-rosely-dusk">
          {row.timeClassification || "—"}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "technicalFit",
      header: "Tech Fit",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-rosely-dusk">
          {row.technicalFit || "—"}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "functionalFit",
      header: "Func. Fit",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-rosely-dusk">
          {row.functionalFit || "—"}
        </span>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search applications…"
          className="w-72"
        />
        <select
          value={filterHealth}
          onChange={(e) => {
            setFilterHealth(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none"
        >
          <option value="all">All Health</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
          <option value="Critical">Critical</option>
        </select>
        <select
          value={filterLifecycle}
          onChange={(e) => {
            setFilterLifecycle(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none"
        >
          <option value="all">All Lifecycle</option>
          <option value="Plan">Plan</option>
          <option value="Phase In">Phase In</option>
          <option value="Active">Active</option>
          <option value="Phase Out">Phase Out</option>
          <option value="End of Life">End of Life</option>
        </select>
        <span className="text-xs text-rosely-mist ml-auto">
          {filtered.length} of {applications.length} shown
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginated}
        getRowKey={(row) => row.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={toggleSort}
        emptyMessage="No applications match your filters."
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
