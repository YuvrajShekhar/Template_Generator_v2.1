import * as React from "react";
import { cn } from "@shared/utils/cn";

interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip link for keyboard accessibility
 * Becomes visible when focused via keyboard
 */
export function SkipLink({
  targetId,
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  const handleClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      handleClick(event);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Visually hidden by default
        "sr-only focus:not-sr-only",
        // When focused, show as a fixed banner
        "focus:fixed focus:top-0 focus:left-0 focus:right-0 focus:z-50",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:px-4 focus:py-3 focus:text-sm focus:font-medium",
        "focus:shadow-lg focus:outline-none",
        className
      )}
    >
      {children}
    </a>
  );
}
