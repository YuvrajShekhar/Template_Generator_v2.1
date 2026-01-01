import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@shared/constants/api";
import { documentGeneratorApi } from "../services/documentGeneratorApi";
import type { PlaceholdersResponse, Placeholder, FormValues } from "../types";

/**
 * Hook to fetch placeholders for a specific template
 */
export function usePlaceholders(filename: string | undefined) {
  return useQuery<PlaceholdersResponse, Error>({
    queryKey: QUERY_KEYS.placeholders(filename ?? ""),
    queryFn: () => documentGeneratorApi.getPlaceholders(filename!),
    enabled: !!filename,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get initial form values from placeholders
 */
export function getInitialFormValues(
  placeholders: Placeholder[],
  provider?: string
): FormValues {
  const values: FormValues = {};

  placeholders.forEach((ph) => {
    // Handle PROVIDER placeholder specially
    if (ph.name === "PROVIDER" && provider) {
      values[ph.name] = provider;
      return;
    }

    // Set initial values based on type
    switch (ph.type) {
      case "date":
        values[ph.name] = getDateWithOffset(ph.offset ?? 0);
        break;
      case "boolean":
        values[ph.name] = false;
        break;
      case "number":
        values[ph.name] = "";
        break;
      case "enum":
        values[ph.name] = ph.values?.[0]?.toString() ?? "";
        break;
      default:
        values[ph.name] = "";
    }
  });

  return values;
}

/**
 * Get a date string with offset in ISO format (YYYY-MM-DD)
 */
function getDateWithOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Convert form values to context for document generation
 * Handles date format conversion (ISO -> German format)
 */
export function formValuesToContext(
  values: FormValues,
  placeholders: Placeholder[]
): Record<string, unknown> {
  const context: Record<string, unknown> = { ...values };

  placeholders.forEach((ph) => {
    if (ph.type === "date" && typeof context[ph.name] === "string") {
      const isoDate = context[ph.name] as string;
      if (isoDate) {
        const [year, month, day] = isoDate.split("-");
        context[ph.name] = `${day}.${month}.${year}`;
      }
    }
  });

  return context;
}

/**
 * Create a map of placeholders by name for quick lookup
 */
export function createPlaceholderMap(
  placeholders: Placeholder[]
): Map<string, Placeholder> {
  const map = new Map<string, Placeholder>();
  placeholders.forEach((ph) => map.set(ph.name, ph));
  return map;
}
