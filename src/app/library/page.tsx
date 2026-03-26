"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { useSettingsStore } from "@/store/settings-store";
import { db } from "@/lib/db-client";
import type { ModuleRubric } from "@/lib/module-rubrics";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Download,
  Loader2,
  Library,
  GraduationCap,
  MapPin,
} from "lucide-react";

interface SharedOutline {
  id: number;
  institution_name: string;
  country: string;
  module_code: string;
  module_name: string;
  lecturer: string;
  turnitin_threshold: number;
  outline_data: unknown;
  download_count: number;
  created_at: string;
}

export default function LibraryPage() {
  const { setModuleOutline, selectedModule } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [results, setResults] = useState<SharedOutline[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    setSearched(true);
    try {
      // Determine if query looks like a module code or institution name
      const isModuleCode = /^[A-Z]{2,5}\d{3,5}$/i.test(searchQuery.trim());
      const data = await db.searchSharedOutlines(
        isModuleCode ? undefined : searchQuery || undefined,
        isModuleCode ? searchQuery : undefined,
      );

      let filtered = Array.isArray(data) ? data : [];
      if (countryFilter) {
        filtered = filtered.filter(
          (r: SharedOutline) =>
            r.country?.toLowerCase() === countryFilter.toLowerCase(),
        );
      }
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, countryFilter]);

  async function handleUseOutline(outline: SharedOutline) {
    setLoadingId(outline.id);
    try {
      // Increment download count
      await db.incrementOutlineDownload(outline.id);

      // Load outline into settings
      const outlineData = outline.outline_data as ModuleRubric;
      setModuleOutline(outline.module_code, outlineData);

      // Update results to reflect new download count
      setResults((prev) =>
        prev.map((r) =>
          r.id === outline.id
            ? { ...r, download_count: r.download_count + 1 }
            : r,
        ),
      );
    } catch {
      // Silently handle - outline still loaded locally
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto w-full max-w-5xl flex-1 p-6">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Library className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-bold">Module Library</h2>
          </div>
          <p className="text-muted-foreground">
            Browse outlines shared by students across institutions. Find your
            module and load the outline directly into TurnItOut.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Search by institution or module code
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. Cornerstone, ACDF5150..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-32">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Country
              </label>
              <Input
                placeholder="e.g. ZA"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="sm:w-28"
            >
              {searching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {!searched ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-30" />
            <p className="text-sm">
              Search for module outlines shared by other students
            </p>
            <p className="text-xs">
              Try searching for your institution name or module code
            </p>
          </Card>
        ) : results.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
            <Search className="h-10 w-10 opacity-30" />
            <p className="text-sm">No outlines found</p>
            <p className="text-xs">
              Try a different search term, or be the first to share an outline
              for your module
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((outline) => (
              <Card key={outline.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="mb-1.5 text-[10px]">
                        <GraduationCap className="mr-1 h-2.5 w-2.5" />
                        {outline.institution_name}
                      </Badge>
                      <CardTitle className="text-base">
                        <span className="font-mono text-xs text-muted-foreground">
                          {outline.module_code}
                        </span>{" "}
                        {outline.module_name}
                      </CardTitle>
                    </div>
                    {outline.country && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        <MapPin className="mr-0.5 h-2.5 w-2.5" />
                        {outline.country}
                      </Badge>
                    )}
                  </div>
                  {outline.lecturer && (
                    <CardDescription className="text-xs">
                      Lecturer: {outline.lecturer}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {outline.turnitin_threshold && (
                      <span>Turnitin: {outline.turnitin_threshold}%</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {outline.download_count} uses
                    </span>
                  </div>
                </CardContent>
                <div className="px-4 pb-4">
                  <Button
                    size="sm"
                    className="w-full"
                    variant={
                      outline.module_code === selectedModule
                        ? "default"
                        : "outline"
                    }
                    disabled={loadingId === outline.id}
                    onClick={() => handleUseOutline(outline)}
                  >
                    {loadingId === outline.id ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-3.5 w-3.5" />
                    )}
                    Use This Outline
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
