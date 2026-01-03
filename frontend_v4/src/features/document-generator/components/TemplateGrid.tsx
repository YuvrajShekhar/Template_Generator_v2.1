import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { TemplateCard } from "./TemplateCard";
import { NoSearchResults } from "@shared/components/feedback";
import { cn } from "@shared/utils/cn";
import type { TemplateItem } from "../types";

interface TemplateGridProps {
  templates: TemplateItem[];
  selectedProvider?: string;
  onClearFilters?: () => void;
  onPreview?: (template: TemplateItem) => void;
  className?: string;
}

export function TemplateGrid({
  templates,
  selectedProvider,
  onClearFilters,
  onPreview,
  className,
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <NoSearchResults
        query=""
        onClear={onClearFilters}
        className="py-16"
      />
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {templates.map((template) => (
          <TemplateCard
            key={template.filename}
            template={template}
            selectedProvider={selectedProvider}
            onPreview={onPreview}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
