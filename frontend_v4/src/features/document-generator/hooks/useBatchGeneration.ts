import * as React from "react";
import { nanoid } from "nanoid";
import { documentGeneratorApi } from "../services";
import type { BatchItem, BatchGenerationState } from "../types/batch";

interface UseBatchGenerationOptions {
  onComplete?: (results: BatchItem[]) => void;
  onError?: (error: Error) => void;
  delayBetweenRequests?: number;
}

/**
 * Hook for managing batch document generation
 */
export function useBatchGeneration(
  templateFilename: string,
  options: UseBatchGenerationOptions = {}
) {
  const { onComplete, onError, delayBetweenRequests = 500 } = options;

  const [state, setState] = React.useState<BatchGenerationState>({
    items: [],
    templateFilename,
    isGenerating: false,
    progress: 0,
    completedCount: 0,
    errorCount: 0,
  });

  const abortControllerRef = React.useRef<AbortController | null>(null);

  /**
   * Add a single item to the batch
   */
  const addItem = React.useCallback((values: Record<string, unknown>) => {
    const newItem: BatchItem = {
      id: nanoid(),
      values,
      status: "pending",
    };
    setState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    return newItem.id;
  }, []);

  /**
   * Add multiple items to the batch
   */
  const addItems = React.useCallback((itemsData: Record<string, unknown>[]) => {
    const newItems: BatchItem[] = itemsData.map((values) => ({
      id: nanoid(),
      values,
      status: "pending",
    }));
    setState((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
    return newItems.map((item) => item.id);
  }, []);

  /**
   * Remove an item from the batch
   */
  const removeItem = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, []);

  /**
   * Update an item's values
   */
  const updateItem = React.useCallback(
    (id: string, values: Record<string, unknown>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, values, status: "pending" } : item
        ),
      }));
    },
    []
  );

  /**
   * Clear all items
   */
  const clearItems = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: [],
      progress: 0,
      completedCount: 0,
      errorCount: 0,
    }));
  }, []);

  /**
   * Reset item statuses
   */
  const resetStatuses = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        status: "pending",
        error: undefined,
      })),
      progress: 0,
      completedCount: 0,
      errorCount: 0,
    }));
  }, []);

  /**
   * Generate all documents in the batch
   */
  const generateAll = React.useCallback(async () => {
    if (state.items.length === 0) return;

    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      completedCount: 0,
      errorCount: 0,
    }));

    const results: BatchItem[] = [];
    let completedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < state.items.length; i++) {
      // Check for abort
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      const item = state.items[i];

      // Update status to generating
      setState((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === item.id ? { ...it, status: "generating" } : it
        ),
      }));

      try {
        // Generate document
        await documentGeneratorApi.generateDocument(
          templateFilename,
          item.values as Record<string, string>
        );

        completedCount++;
        const updatedItem: BatchItem = {
          ...item,
          status: "success",
          filename: templateFilename,
        };
        results.push(updatedItem);

        setState((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.id === item.id ? updatedItem : it
          ),
          progress: ((i + 1) / state.items.length) * 100,
          completedCount,
        }));
      } catch (err) {
        errorCount++;
        const errorMessage =
          err instanceof Error ? err.message : "Generation failed";
        const updatedItem: BatchItem = {
          ...item,
          status: "error",
          error: errorMessage,
        };
        results.push(updatedItem);

        setState((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.id === item.id ? updatedItem : it
          ),
          progress: ((i + 1) / state.items.length) * 100,
          errorCount,
        }));

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      }

      // Delay between requests to avoid overwhelming the server
      if (i < state.items.length - 1 && !abortControllerRef.current?.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
      }
    }

    setState((prev) => ({
      ...prev,
      isGenerating: false,
    }));

    if (onComplete) {
      onComplete(results);
    }

    return results;
  }, [state.items, templateFilename, onComplete, onError, delayBetweenRequests]);

  /**
   * Cancel ongoing generation
   */
  const cancelGeneration = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isGenerating: false,
      }));
    }
  }, []);

  /**
   * Import items from CSV data
   */
  const importFromCSV = React.useCallback(
    (csvContent: string, fieldMapping?: Record<string, string>) => {
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        return { success: false, count: 0, errors: ["CSV must have header and data rows"] };
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const errors: string[] = [];
      const items: Record<string, unknown>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const item: Record<string, unknown> = {};
        headers.forEach((header, idx) => {
          const fieldName = fieldMapping?.[header] || header;
          item[fieldName] = values[idx];
        });
        items.push(item);
      }

      if (items.length > 0) {
        addItems(items);
      }

      return { success: errors.length === 0, count: items.length, errors };
    },
    [addItems]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    addItem,
    addItems,
    removeItem,
    updateItem,
    clearItems,
    resetStatuses,
    generateAll,
    cancelGeneration,
    importFromCSV,
    pendingCount: state.items.filter((i) => i.status === "pending").length,
  };
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
