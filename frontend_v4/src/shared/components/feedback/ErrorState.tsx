import * as React from "react";
import { cn } from "@shared/utils/cn";
import { Button } from "../ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: React.ReactNode;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
  icon,
  fullScreen = false,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4",
        fullScreen && "fixed inset-0 bg-background z-50",
        !fullScreen && "py-12 px-4",
        className
      )}
    >
      <div className="rounded-full bg-destructive/10 p-4">
        {icon || (
          <AlertCircle className="h-8 w-8 text-destructive" />
        )}
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Inline error message for forms
 */
interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <p className={cn("text-sm text-destructive mt-1", className)}>
      {message}
    </p>
  );
}

/**
 * Error boundary fallback component
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      title="Application Error"
      message={error.message || "An unexpected error occurred."}
      onRetry={resetErrorBoundary}
      retryLabel="Reload"
      fullScreen
    />
  );
}
