import * as React from "react";

/**
 * Hook to handle keyboard navigation in a list
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  itemCount: number,
  options: {
    onSelect?: (index: number) => void;
    onEscape?: () => void;
    loop?: boolean;
    orientation?: "vertical" | "horizontal" | "both";
  } = {}
) {
  const { onSelect, onEscape, loop = true, orientation = "vertical" } = options;
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<T>(null);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (itemCount === 0) return;

      const isVertical = orientation === "vertical" || orientation === "both";
      const isHorizontal = orientation === "horizontal" || orientation === "both";

      let nextIndex = activeIndex;

      switch (event.key) {
        case "ArrowDown":
          if (isVertical) {
            event.preventDefault();
            if (activeIndex === -1) {
              nextIndex = 0;
            } else if (loop) {
              nextIndex = (activeIndex + 1) % itemCount;
            } else {
              nextIndex = Math.min(activeIndex + 1, itemCount - 1);
            }
          }
          break;

        case "ArrowUp":
          if (isVertical) {
            event.preventDefault();
            if (activeIndex === -1) {
              nextIndex = itemCount - 1;
            } else if (loop) {
              nextIndex = (activeIndex - 1 + itemCount) % itemCount;
            } else {
              nextIndex = Math.max(activeIndex - 1, 0);
            }
          }
          break;

        case "ArrowRight":
          if (isHorizontal) {
            event.preventDefault();
            if (activeIndex === -1) {
              nextIndex = 0;
            } else if (loop) {
              nextIndex = (activeIndex + 1) % itemCount;
            } else {
              nextIndex = Math.min(activeIndex + 1, itemCount - 1);
            }
          }
          break;

        case "ArrowLeft":
          if (isHorizontal) {
            event.preventDefault();
            if (activeIndex === -1) {
              nextIndex = itemCount - 1;
            } else if (loop) {
              nextIndex = (activeIndex - 1 + itemCount) % itemCount;
            } else {
              nextIndex = Math.max(activeIndex - 1, 0);
            }
          }
          break;

        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;

        case "End":
          event.preventDefault();
          nextIndex = itemCount - 1;
          break;

        case "Enter":
        case " ":
          if (activeIndex >= 0) {
            event.preventDefault();
            onSelect?.(activeIndex);
          }
          break;

        case "Escape":
          event.preventDefault();
          setActiveIndex(-1);
          onEscape?.();
          break;
      }

      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);
      }
    },
    [activeIndex, itemCount, loop, orientation, onSelect, onEscape]
  );

  const resetActiveIndex = React.useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    resetActiveIndex,
    handleKeyDown,
    containerRef,
    getItemProps: (index: number) => ({
      tabIndex: activeIndex === index ? 0 : -1,
      "aria-selected": activeIndex === index,
      "data-active": activeIndex === index,
    }),
  };
}

/**
 * Hook to trap focus within a container
 */
export function useFocusTrap(active: boolean = true) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Focus first element when trap is activated
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return containerRef;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const announce = React.useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const element = document.createElement("div");
      element.setAttribute("aria-live", priority);
      element.setAttribute("aria-atomic", "true");
      element.setAttribute(
        "style",
        "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"
      );
      document.body.appendChild(element);

      // Delay to ensure screen reader picks up the change
      setTimeout(() => {
        element.textContent = message;
      }, 100);

      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(element);
      }, 1000);
    },
    []
  );

  return announce;
}

/**
 * Hook to manage focus on route change
 */
export function useFocusOnMount(shouldFocus: boolean = true) {
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [shouldFocus]);

  return elementRef;
}

/**
 * Generate unique IDs for accessibility
 */
let idCounter = 0;
export function useId(prefix: string = "id"): string {
  const [id] = React.useState(() => `${prefix}-${++idCounter}`);
  return id;
}

/**
 * Hook for handling skip links
 */
export function useSkipLink(targetId: string) {
  const skipToContent = React.useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetId]);

  return skipToContent;
}
