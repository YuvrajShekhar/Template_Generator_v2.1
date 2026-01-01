import * as React from "react";

const STORAGE_KEY = "docmanager:recent-templates";
const MAX_RECENT = 5;

export interface RecentTemplate {
  filename: string;
  name: string;
  provider?: string;
  accessedAt: number;
}

/**
 * Hook to manage recent templates history in localStorage
 */
export function useRecentTemplates() {
  const [recentTemplates, setRecentTemplates] = React.useState<RecentTemplate[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentTemplate[];
        setRecentTemplates(parsed);
      }
    } catch (error) {
      console.warn("Failed to load recent templates:", error);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = React.useCallback((templates: RecentTemplate[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.warn("Failed to save recent templates:", error);
    }
  }, []);

  /**
   * Add a template to recent history
   */
  const addRecent = React.useCallback(
    (template: Omit<RecentTemplate, "accessedAt">) => {
      setRecentTemplates((prev) => {
        // Remove existing entry for this template
        const filtered = prev.filter((t) => t.filename !== template.filename);

        // Add new entry at the beginning
        const newEntry: RecentTemplate = {
          ...template,
          accessedAt: Date.now(),
        };

        // Keep only MAX_RECENT items
        const updated = [newEntry, ...filtered].slice(0, MAX_RECENT);

        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  /**
   * Remove a template from recent history
   */
  const removeRecent = React.useCallback(
    (filename: string) => {
      setRecentTemplates((prev) => {
        const updated = prev.filter((t) => t.filename !== filename);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  /**
   * Clear all recent templates
   */
  const clearRecent = React.useCallback(() => {
    setRecentTemplates([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear recent templates:", error);
    }
  }, []);

  /**
   * Check if a template is in recent history
   */
  const isRecent = React.useCallback(
    (filename: string) => {
      return recentTemplates.some((t) => t.filename === filename);
    },
    [recentTemplates]
  );

  return {
    recentTemplates,
    addRecent,
    removeRecent,
    clearRecent,
    isRecent,
    hasRecent: recentTemplates.length > 0,
  };
}
