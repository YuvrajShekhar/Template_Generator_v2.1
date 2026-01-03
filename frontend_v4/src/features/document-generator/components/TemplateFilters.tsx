import * as React from "react";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import {
  Input,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import type { TemplateFilters as FilterState } from "../types";

interface TemplateFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  providers: string[];
  categories: string[];
  totalCount: number;
  filteredCount: number;
  className?: string;
}

export function TemplateFilters({
  filters,
  onFilterChange,
  providers,
  categories,
  totalCount,
  filteredCount,
  className,
}: TemplateFiltersProps) {
  const hasActiveFilters =
    filters.provider !== "" ||
    filters.category !== "" ||
    filters.search !== "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleProviderChange = (value: string) => {
    onFilterChange({ ...filters, provider: value === "all" ? "" : value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value === "all" ? "" : value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      provider: "",
      category: "",
      search: "",
      tags: [],
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            placeholder="Search templates..."
            value={filters.search}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              filters.search ? (
                <button
                  onClick={() => onFilterChange({ ...filters, search: "" })}
                  className="hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
            className="h-10"
          />
        </div>

        {/* Provider Filter */}
        <Select
          value={filters.provider || "all"}
          onValueChange={handleProviderChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Providers" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters & Count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          templates
        </p>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.provider && (
              <Badge variant="secondary" className="gap-1">
                Provider: {filters.provider}
                <button
                  onClick={() => onFilterChange({ ...filters, provider: "" })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <button
                  onClick={() => onFilterChange({ ...filters, category: "" })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <button
                  onClick={() => onFilterChange({ ...filters, search: "" })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
