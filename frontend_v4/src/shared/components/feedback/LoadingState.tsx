import * as React from "react";
import { cn } from "@shared/utils/cn";
import { Spinner } from "../ui/Spinner";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Loading...",
  size = "default",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        !fullScreen && "py-12",
        className
      )}
    >
      <Spinner size={size} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

/**
 * Skeleton component for loading placeholders
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        {
          "rounded-md": variant === "default",
          "rounded-full": variant === "circular",
          "rounded h-4 w-full": variant === "text",
        },
        className
      )}
      {...props}
    />
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Table skeleton for loading states
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
