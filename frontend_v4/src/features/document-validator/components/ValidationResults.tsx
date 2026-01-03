import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
} from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import type { NormalizedValidationResult, ValidationIssue, IssueSeverity } from "../types";

interface ValidationResultsProps {
  result: NormalizedValidationResult | undefined;
  className?: string;
}

const severityConfig: Record<
  IssueSeverity,
  {
    icon: React.ElementType;
    label: string;
    className: string;
    badgeVariant: "destructive" | "warning" | "info" | "success";
  }
> = {
  error: {
    icon: AlertCircle,
    label: "Error",
    className: "bg-destructive/10 border-destructive/20 text-destructive",
    badgeVariant: "destructive",
  },
  warn: {
    icon: AlertTriangle,
    label: "Warning",
    className: "bg-warning/10 border-warning/20 text-warning",
    badgeVariant: "warning",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "bg-info/10 border-info/20 text-info",
    badgeVariant: "info",
  },
};

function IssueItem({ issue, index }: { issue: ValidationIssue; index: number }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  const handleCopyExcerpt = async () => {
    if (issue.excerpt) {
      await navigator.clipboard.writeText(issue.excerpt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasDetails = issue.hint || issue.excerpt || issue.location;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-lg border p-3 transition-all",
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {/* Title and Code */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">
                {issue.title || issue.code}
              </p>
              {issue.title && issue.code && (
                <Badge variant="outline" size="sm" className="mt-1">
                  {issue.code}
                </Badge>
              )}
            </div>
            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="shrink-0 h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Message */}
          {issue.message && (
            <p className="text-sm text-muted-foreground mt-1">
              {issue.message}
            </p>
          )}

          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && hasDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 pt-3 border-t border-current/10">
                  {/* Location */}
                  {issue.location && (
                    <div className="text-xs">
                      <span className="font-medium">Location: </span>
                      {issue.location.paragraph && (
                        <span>Paragraph {issue.location.paragraph}</span>
                      )}
                      {issue.location.span && (
                        <span>
                          , Characters {issue.location.span[0]}-{issue.location.span[1]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Excerpt */}
                  {issue.excerpt && (
                    <div className="relative">
                      <pre className="text-xs bg-background/50 rounded p-2 overflow-x-auto">
                        {issue.excerpt}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyExcerpt}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Hint */}
                  {issue.hint && (
                    <div className="text-xs bg-background/50 rounded p-2">
                      <span className="font-medium">💡 Hint: </span>
                      {issue.hint}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function ValidationResults({ result, className }: ValidationResultsProps) {
  if (!result) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Validation Results
          </CardTitle>
          <CardDescription>
            Upload a file to see validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileCheck className="h-12 w-12 mb-3 opacity-20" />
            <p>No validation results yet</p>
            <p className="text-sm">Drop a .docx file above to validate</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { filename, ok, issues, stats } = result;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {ok && stats.errors === 0 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Validation Results
            </CardTitle>
            <CardDescription className="mt-1">
              {filename}
            </CardDescription>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2">
            {stats.errors > 0 && (
              <Badge variant="destructive">
                {stats.errors} error{stats.errors !== 1 ? "s" : ""}
              </Badge>
            )}
            {stats.warnings > 0 && (
              <Badge variant="warning">
                {stats.warnings} warning{stats.warnings !== 1 ? "s" : ""}
              </Badge>
            )}
            {stats.info > 0 && (
              <Badge variant="info">
                {stats.info} info
              </Badge>
            )}
            {stats.total === 0 && (
              <Badge variant="success">
                No issues
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {issues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-success">
              All checks passed!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your document template is valid and ready to use
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Group issues by severity */}
            {(["error", "warn", "info"] as IssueSeverity[]).map((severity) => {
              const severityIssues = issues.filter((i) => i.severity === severity);
              if (severityIssues.length === 0) return null;

              return (
                <div key={severity}>
                  {severity !== "error" && <Separator className="my-4" />}
                  <div className="space-y-2">
                    {severityIssues.map((issue, idx) => (
                      <IssueItem
                        key={`${issue.code}-${idx}`}
                        issue={issue}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
