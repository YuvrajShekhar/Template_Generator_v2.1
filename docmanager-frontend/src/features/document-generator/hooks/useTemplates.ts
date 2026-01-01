import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@shared/constants/api";
import { documentGeneratorApi } from "../services/documentGeneratorApi";
import type { TemplatesResponse } from "../types";

/**
 * Hook to fetch all available templates
 */
export function useTemplates() {
  return useQuery<TemplatesResponse, Error>({
    queryKey: QUERY_KEYS.templates,
    queryFn: documentGeneratorApi.getTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Extract unique providers from templates
 */
export function useTemplateProviders(templates: TemplatesResponse | undefined) {
  if (!templates?.files) return [];
  
  const providers = new Set<string>();
  templates.files.forEach((file) => {
    file.meta.provider?.forEach((p) => providers.add(p));
  });
  
  return Array.from(providers).sort((a, b) => a.localeCompare(b));
}

/**
 * Extract unique categories from templates
 */
export function useTemplateCategories(templates: TemplatesResponse | undefined) {
  if (!templates?.files) return [];
  
  const categories = new Set<string>();
  templates.files.forEach((file) => {
    file.meta.category?.forEach((c) => categories.add(c));
  });
  
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

/**
 * Extract unique tags from templates
 */
export function useTemplateTags(templates: TemplatesResponse | undefined) {
  if (!templates?.files) return [];
  
  const tags = new Set<string>();
  templates.files.forEach((file) => {
    file.meta.tags?.forEach((t) => tags.add(t));
  });
  
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}
