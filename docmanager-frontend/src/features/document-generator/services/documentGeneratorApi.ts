import { api } from "@shared/hooks/useApi";
import { API_ENDPOINTS } from "@shared/constants/api";
import type {
  TemplatesResponse,
  PlaceholdersResponse,
  GenerateDocRequest,
} from "../types";

/**
 * Document Generator API Service
 */
export const documentGeneratorApi = {
  /**
   * Fetch all available templates
   */
  getTemplates: async (): Promise<TemplatesResponse> => {
    return api.get<TemplatesResponse>(API_ENDPOINTS.TEMPLATES);
  },

  /**
   * Fetch placeholders and metadata for a specific template
   */
  getPlaceholders: async (filename: string): Promise<PlaceholdersResponse> => {
    return api.post<PlaceholdersResponse>(API_ENDPOINTS.PLACEHOLDERS, {
      filename,
    });
  },

  /**
   * Generate a document from a template with context data
   * Returns the blob for preview/download
   */
  generateDocument: async (
    filename: string,
    context: Record<string, unknown>
  ): Promise<Blob> => {
    const request: GenerateDocRequest = { filename, context };
    return api.post<Blob>(API_ENDPOINTS.GENERATE_DOC, request as unknown as Record<string, unknown>);
  },
};

export default documentGeneratorApi;
