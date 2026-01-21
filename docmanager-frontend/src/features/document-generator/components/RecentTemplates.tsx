import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, FileText, X, ChevronRight } from "lucide-react";
import { cn } from "@shared/utils/cn";
import { Button } from "@shared/components/ui";
import { useRecentTemplates, type RecentTemplate } from "../hooks/useRecentTemplates";

interface RecentTemplatesProps {
  className?: string;
  onSelect?: (template: RecentTemplate) => void;
}

/**
 * Display recent templates for quick access
 */
export function RecentTemplates({ className, onSelect }: RecentTemplatesProps) {
  const navigate = useNavigate();
  const { recentTemplates, removeRecent, clearRecent, hasRecent } = useRecentTemplates();

  if (!hasRecent) {
    return null;
  }

  const handleSelect = (template: RecentTemplate) => {
    if (onSelect) {
      onSelect(template);
    } else {
      const path = template.provider
        ? `/generator/${encodeURIComponent(template.filename)}/${encodeURIComponent(template.provider)}`
        : `/generator/${encodeURIComponent(template.filename)}`;
      navigate(path);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Recent Templates</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecent}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {recentTemplates.map((template) => (
            <motion.div
              key={template.filename}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <RecentTemplateChip
                template={template}
                onSelect={() => handleSelect(template)}
                onRemove={() => removeRecent(template.filename)}
                timeAgo={formatTimeAgo(template.accessedAt)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Individual recent template chip
 */
function RecentTemplateChip({
  template,
  onSelect,
  onRemove,
  timeAgo,
}: {
  template: RecentTemplate;
  onSelect: () => void;
  onRemove: () => void;
  timeAgo: string;
}) {
  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full",
        "border bg-card px-3 py-1.5 text-sm",
        "hover:bg-accent hover:border-accent-foreground/20",
        "transition-colors cursor-pointer"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium truncate max-w-[150px]">
        {template.name || template.filename}
      </span>
      {template.provider && (
        <span className="text-xs text-muted-foreground">
          • {template.provider}
        </span>
      )}
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {timeAgo}
      </span>
      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "absolute -top-1 -right-1 rounded-full p-0.5",
          "bg-muted text-muted-foreground",
          "opacity-0 group-hover:opacity-100",
          "hover:bg-destructive hover:text-destructive-foreground",
          "transition-all"
        )}
        aria-label={`Remove ${template.name || template.filename} from recent`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/**
 * Compact version for sidebar or header
 */
export function RecentTemplatesCompact({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { recentTemplates, hasRecent } = useRecentTemplates();

  if (!hasRecent) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground px-2">Recent</p>
      {recentTemplates.slice(0, 3).map((template) => (
        <button
          key={template.filename}
          onClick={() => {
            const path = template.provider
              ? `/generator/${encodeURIComponent(template.filename)}/${encodeURIComponent(template.provider)}`
              : `/generator/${encodeURIComponent(template.filename)}`;
            navigate(path);
          }}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-colors text-left"
          )}
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{template.name || template.filename}</span>
        </button>
      ))}
    </div>
  );
}
