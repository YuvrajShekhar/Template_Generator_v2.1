import { motion } from "framer-motion";
import { FileText, User, Building2, Tag, Calendar } from "lucide-react";
import { Badge, Card, CardContent } from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import type { TemplateMeta } from "../types";

interface TemplateHeaderProps {
  filename: string;
  meta: TemplateMeta;
  provider?: string;
  className?: string;
}

export function TemplateHeader({
  filename,
  meta,
  provider,
  className,
}: TemplateHeaderProps) {
  const displayName = meta.name || filename.replace(/\.docx$/i, "").replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20", className)}>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground truncate">
                {displayName}
              </h2>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                {/* Creator */}
                {meta.creator && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{meta.creator}</span>
                  </div>
                )}

                {/* Version */}
                {meta.version && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>v{meta.version}</span>
                  </div>
                )}

                {/* Selected Provider */}
                {provider && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-medium text-primary">{provider}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags & Categories */}
            <div className="flex flex-wrap gap-2">
              {meta.category?.map((cat) => (
                <Badge key={cat} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {cat}
                </Badge>
              ))}
              {meta.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description if available */}
          {meta.description && (
            <p className="mt-3 text-sm text-muted-foreground border-t border-primary/10 pt-3">
              {meta.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
