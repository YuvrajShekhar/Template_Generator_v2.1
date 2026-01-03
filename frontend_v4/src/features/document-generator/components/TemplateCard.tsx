import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, User, Tag, Building2, ArrowRight, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import type { TemplateItem } from "../types";

interface TemplateCardProps {
  template: TemplateItem;
  selectedProvider?: string;
  className?: string;
  onPreview?: (template: TemplateItem) => void;
}

export function TemplateCard({
  template,
  selectedProvider,
  className,
  onPreview,
}: TemplateCardProps) {
  const navigate = useNavigate();
  const { filename, meta } = template;

  const handleClick = () => {
    const encodedFilename = encodeURIComponent(filename);
    if (selectedProvider) {
      navigate(`/generator/${encodedFilename}/${encodeURIComponent(selectedProvider)}`);
    } else {
      navigate(`/generator/${encodedFilename}`);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(template);
    }
  };

  // Display name: use meta.name if available, otherwise clean up filename
  const displayName = meta.name || filename.replace(/\.docx$/i, "").replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200",
          "hover:shadow-lg hover:border-primary/50",
          "h-full flex flex-col",
          className
        )}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            {/* Title & Version */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {displayName}
              </CardTitle>
              {meta.version && (
                <CardDescription className="text-xs mt-0.5">
                  Version {meta.version}
                </CardDescription>
              )}
            </div>

            {/* Preview button */}
            {onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
                title="Preview template"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Meta info */}
          <div className="space-y-2 flex-1">
            {/* Creator */}
            {meta.creator && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{meta.creator}</span>
              </div>
            )}

            {/* Providers */}
            {meta.provider && meta.provider.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{meta.provider.join(", ")}</span>
              </div>
            )}

            {/* Categories */}
            {meta.category && meta.category.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{meta.category.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
              {meta.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {meta.tags.length > 3 && (
                <Badge variant="ghost" size="sm" className="text-xs">
                  +{meta.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action hint */}
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Select template</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
