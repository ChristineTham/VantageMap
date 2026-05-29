import type { Metadata } from "next";
import { SearchPageView } from "@/components/SearchPageView";

export const metadata: Metadata = {
  title: "Search – VantageMap",
  description: "Search across all fact sheets in the enterprise architecture platform.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; types?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, types, page } = await searchParams;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Search</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Search across all fact sheets in the enterprise architecture.
        </p>
      </div>
      <SearchPageView
        initialQuery={q ?? ""}
        initialTypes={types?.split(",").filter(Boolean) ?? []}
        initialPage={page ? parseInt(page, 10) : 1}
      />
    </div>
  );
}
