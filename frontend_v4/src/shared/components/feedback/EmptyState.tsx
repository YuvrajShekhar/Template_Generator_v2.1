import * as React from "react";
import { cn } from "@shared/utils/cn";
import { Button } from "../ui/Button";
import { FileQuestion, Search, FolderOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  variant?: "default" | "search" | "folder" | "file";
}

const variantIcons = {
  default: FileQuestion,
  search: Search,
  folder: FolderOpen,
  file: FileQuestion,
};

export function EmptyState({
  title = "No data found",
  message = "There's nothing here yet.",
  icon,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const IconComponent = variantIcons[variant];
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4 py-12 px-4",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        {icon || <IconComponent className="h-8 w-8 text-muted-foreground" />}
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          leftIcon={action.icon || <Plus className="h-4 w-4" />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty search results state
 */
interface NoSearchResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export function NoSearchResults({
  query,
  onClear,
  className,
}: NoSearchResultsProps) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      message={
        query
          ? `No results found for "${query}". Try adjusting your search or filters.`
          : "Try adjusting your search or filters."
      }
      action={
        onClear
          ? {
              label: "Clear search",
              onClick: onClear,
            }
          : undefined
      }
      className={className}
    />
  );
}
