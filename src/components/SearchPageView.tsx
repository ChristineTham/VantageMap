"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FACT_SHEET_CONFIGS } from "@/lib/fact-sheet-config";
import { HealthBadge } from "@/components/StatusBadge";
import { LifecycleTag } from "@/components/LifecycleTag";
import { Pagination } from "@/components/Pagination";

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

interface GroupedResult {
  type: string;
  count: number;
  results: SearchResult[];
}

interface SearchPageViewProps {
  initialQuery: string;
  initialTypes: string[];
  initialPage: number;
}

export function SearchPageView({ initialQuery, initialTypes, initialPage }: SearchPageViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);
  const [page, setPage] = useState(initialPage);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [grouped, setGrouped] = useState<GroupedResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(initialTypes.length > 0);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const doSearch = useCallback(async (q: string, types: string[], p: number) => {
    if (!q.trim()) {
      setResults([]);
      setGrouped([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (types.length > 0) params.set("types", types.join(","));
      if (p > 1) params.set("page", String(p));
      params.set("pageSize", "20");

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed");

      const body = await res.json();
      const data = body.data ?? body;

      setResults(data.results ?? []);
      setGrouped(data.grouped ?? []);
      setTotal(data.meta?.total ?? 0);
      setTotalPages(data.meta?.totalPages ?? 0);
      setHasSearched(true);
    } catch {
      setResults([]);
      setGrouped([]);
      setTotal(0);
      setTotalPages(0);
    }
  }, []);

  // Search on mount if query provided
  useEffect(() => {
    if (initialQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      doSearch(initialQuery, initialTypes, initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    startTransition(() => {
      // Update URL
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
      router.push(`/search?${params}`);
      doSearch(query, selectedTypes, 1);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doSearch(query, selectedTypes, newPage);
    // Update URL
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/search?${params}`);
  };

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const clearTypes = () => {
    setSelectedTypes([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rosely-mist" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all fact sheets…"
            className={cn(
              "w-full rounded-lg border border-rosely-blush bg-white py-2.5 pl-10 pr-4 text-sm text-rosely-night",
              "placeholder:text-rosely-mist",
              "focus:border-rosely-lilac focus:outline-none focus:ring-2 focus:ring-rosely-lilac/30",
              "transition-colors"
            )}
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-colors",
            showFilters
              ? "border-rosely-lilac bg-rosely-petal text-rosely-plum"
              : "border-rosely-blush bg-white text-rosely-dusk hover:border-rosely-lilac"
          )}
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white hover:bg-rosely-plum/90 transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      {/* Type Filters */}
      {showFilters && (
        <div className="rounded-xl border border-rosely-blush bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-rosely-dusk">Filter by type:</span>
            {selectedTypes.length > 0 && (
              <button
                onClick={clearTypes}
                className="text-xs text-rosely-mist hover:text-rosely-rose transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {FACT_SHEET_CONFIGS.map((cfg) => (
              <button
                key={cfg.type}
                onClick={() => toggleType(cfg.type)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedTypes.includes(cfg.type)
                    ? "bg-rosely-plum text-white"
                    : "bg-rosely-cream text-rosely-dusk hover:bg-rosely-petal"
                )}
              >
                {cfg.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-rosely-lilac" />
        </div>
      )}

      {!isPending && hasSearched && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-rosely-blush bg-white px-6 py-12 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-rosely-mist" />
          <h3 className="text-sm font-medium text-rosely-night">No results found</h3>
          <p className="mt-1 text-xs text-rosely-mist">
            Try a different search term or adjust your filters.
          </p>
        </div>
      )}

      {!isPending && results.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-rosely-dusk">
              <span className="font-medium text-rosely-night">{total}</span> results for &quot;
              <span className="font-medium">{query}</span>&quot;
            </p>
            {grouped.length > 0 && (
              <div className="flex items-center gap-2">
                {grouped.map((g) => (
                  <span key={g.type} className="text-xs text-rosely-mist">
                    {g.type}: {g.count}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Result List */}
          <div className="space-y-2">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}

// ── Search Result Card ──────────────────────────────────────────────────────

function SearchResultCard({ result }: { result: SearchResult }) {
  const config = FACT_SHEET_CONFIGS.find((c) => c.type === result.entityType);
  const slug = config?.slug ?? result.entityType.toLowerCase();

  return (
    <Link
      href={`/${slug}/${result.id}`}
      className="block rounded-xl border border-rosely-blush bg-white p-4 hover:border-rosely-lilac hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-rosely-cream px-2 py-0.5 text-xs font-medium text-rosely-dusk">
              {config?.displayName ?? result.entityType}
            </span>
            {result.health && (
              <HealthBadge health={result.health as Parameters<typeof HealthBadge>[0]["health"]} />
            )}
            {result.lifecycle && (
              <LifecycleTag
                lifecycle={result.lifecycle as Parameters<typeof LifecycleTag>[0]["lifecycle"]}
              />
            )}
          </div>
          <h3 className="text-sm font-medium text-rosely-night truncate">{result.name}</h3>
          {result.headline && (
            <p
              className="mt-0.5 text-xs text-rosely-dusk line-clamp-2"
              dangerouslySetInnerHTML={{ __html: result.headline }}
            />
          )}
          {!result.headline && result.description && (
            <p className="mt-0.5 text-xs text-rosely-mist line-clamp-2">{result.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
