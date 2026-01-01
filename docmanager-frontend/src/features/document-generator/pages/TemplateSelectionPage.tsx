import * as React from "react";
import { motion } from "framer-motion";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@shared/components/ui";
import { ErrorState, CardSkeleton } from "@shared/components/feedback";
import {
  useTemplates,
  useTemplateProviders,
  useTemplateCategories,
} from "../hooks";
import { TemplateGrid, TemplateFilters, RecentTemplates } from "../components";
import type { TemplateFilters as FilterState, TemplateItem } from "../types";

export default function TemplateSelectionPage() {
  // Fetch templates
  const { data, isLoading, isError, error, refetch, isFetching } = useTemplates();

  // Filter state
  const [filters, setFilters] = React.useState<FilterState>({
    provider: "",
    category: "",
    search: "",
    tags: [],
  });

  // Extract filter options from templates
  const providers = useTemplateProviders(data);
  const categories = useTemplateCategories(data);

  // Filter templates based on current filters
  const filteredTemplates = React.useMemo(() => {
    if (!data?.files) return [];

    return data.files.filter((template: TemplateItem) => {
      // Provider filter
      if (filters.provider) {
        const templateProviders = template.meta.provider || [];
        if (!templateProviders.includes(filters.provider)) {
          return false;
        }
      }

      // Category filter
      if (filters.category) {
        const templateCategories = template.meta.category || [];
        if (!templateCategories.includes(filters.category)) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const filename = template.filename.toLowerCase();
        const name = (template.meta.name || "").toLowerCase();
        const tags = (template.meta.tags || []).join(" ").toLowerCase();
        const creator = (template.meta.creator || "").toLowerCase();

        if (
          !filename.includes(searchLower) &&
          !name.includes(searchLower) &&
          !tags.includes(searchLower) &&
          !creator.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [data?.files, filters]);

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      provider: "",
      category: "",
      search: "",
      tags: [],
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
          <div className="h-10 w-[180px] bg-muted rounded animate-pulse" />
          <div className="h-10 w-[180px] bg-muted rounded animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title="Failed to load templates"
        message={error?.message || "An error occurred while fetching templates."}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Select a Template
            </h1>
          </div>
          <p className="text-muted-foreground">
            Choose a document template to generate your document
          </p>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          }
        >
          Refresh
        </Button>
      </div>

      {/* Recent Templates */}
      <RecentTemplates />

      {/* Filters */}
      <TemplateFilters
        filters={filters}
        onFilterChange={setFilters}
        providers={providers}
        categories={categories}
        totalCount={data?.files.length ?? 0}
        filteredCount={filteredTemplates.length}
      />

      {/* Template Grid */}
      <TemplateGrid
        templates={filteredTemplates}
        selectedProvider={filters.provider}
        onClearFilters={handleClearFilters}
      />
    </motion.div>
  );
}
