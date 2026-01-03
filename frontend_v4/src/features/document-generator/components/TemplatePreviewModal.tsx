import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  User,
  Calendar,
  Tag,
  FolderOpen,
  Building2,
  Info,
  List,
  ArrowRight,
} from "lucide-react";
import { Button, Badge, Separator } from "@shared/components/ui";
import { LoadingState, ErrorState } from "@shared/components/feedback";
import { cn } from "@shared/utils/cn";
import { usePlaceholders } from "../hooks";
import type { TemplateItem, Meta, Placeholder, LayoutGroup } from "../types";

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (template: TemplateItem, provider?: string) => void;
}

/**
 * Modal for previewing template details before selection
 */
export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  const [selectedProvider, setSelectedProvider] = React.useState<string>("");

  // Fetch placeholders for preview
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePlaceholders(template?.filename || "", {
    enabled: isOpen && !!template,
  });

  // Reset provider when template changes
  React.useEffect(() => {
    if (template?.meta.provider?.length) {
      setSelectedProvider(template.meta.provider[0]);
    } else {
      setSelectedProvider("");
    }
  }, [template]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!template) return null;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(template, selectedProvider || undefined);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-3xl md:w-full md:max-h-[85vh] bg-card rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {template.meta.name || template.filename}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.filename}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata Section */}
              <MetadataSection meta={template.meta} />

              <Separator />

              {/* Provider Selection */}
              {template.meta.provider && template.meta.provider.length > 0 && (
                <>
                  <ProviderSection
                    providers={template.meta.provider}
                    selectedProvider={selectedProvider}
                    onSelect={setSelectedProvider}
                  />
                  <Separator />
                </>
              )}

              {/* Placeholders Preview */}
              <PlaceholdersSection
                data={data}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={() => refetch()}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-muted/30">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSelect} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Use This Template
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Metadata display section
 */
function MetadataSection({ meta }: { meta: Meta }) {
  const items = [
    { icon: User, label: "Creator", value: meta.creator },
    { icon: Calendar, label: "Version", value: meta.version },
    {
      icon: FolderOpen,
      label: "Categories",
      value: meta.category?.join(", "),
    },
    {
      icon: Building2,
      label: "Providers",
      value: meta.provider?.join(", "),
    },
  ].filter((item) => item.value);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Info className="h-4 w-4" />
        Template Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <item.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {meta.tags && meta.tags.length > 0 && (
        <div className="flex items-start gap-3">
          <Tag className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Provider selection section
 */
function ProviderSection({
  providers,
  selectedProvider,
  onSelect,
}: {
  providers: string[];
  selectedProvider: string;
  onSelect: (provider: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Select Provider
      </h3>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <button
            key={provider}
            onClick={() => onSelect(provider)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              selectedProvider === provider
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {provider}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Placeholders preview section
 */
function PlaceholdersSection({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  data?: { placeholders: Placeholder[]; layout: LayoutGroup[] };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState message="Loading template fields..." />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load fields"
        message={error?.message || "Could not load template placeholders"}
        onRetry={onRetry}
      />
    );
  }

  if (!data?.placeholders || data.placeholders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No form fields in this template</p>
      </div>
    );
  }

  // Group placeholders by layout or show flat list
  const visiblePlaceholders = data.placeholders.filter((p) => !p.hidden);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <List className="h-4 w-4" />
        Form Fields ({visiblePlaceholders.length})
      </h3>
      
      {data.layout && data.layout.length > 0 ? (
        // Grouped by layout
        <div className="space-y-4">
          {data.layout.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.group}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.rows.flat().map((fieldName) => {
                  const placeholder = data.placeholders.find(
                    (p) => p.name === fieldName
                  );
                  if (!placeholder || placeholder.hidden) return null;
                  return (
                    <PlaceholderChip
                      key={fieldName}
                      placeholder={placeholder}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visiblePlaceholders.map((placeholder) => (
            <PlaceholderChip key={placeholder.name} placeholder={placeholder} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual placeholder chip
 */
function PlaceholderChip({ placeholder }: { placeholder: Placeholder }) {
  const typeColors: Record<string, string> = {
    string: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    number: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    date: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    enum: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    boolean: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  return (
    <div
      className={cn(
        "px-2 py-1.5 rounded-md text-xs font-medium",
        typeColors[placeholder.type] || "bg-muted"
      )}
    >
      <span className="truncate block">{placeholder.name}</span>
      <span className="text-[10px] opacity-70">
        {placeholder.type}
        {placeholder.optional && " (optional)"}
      </span>
    </div>
  );
}
