import { api, downloadBlob } from "@shared/hooks/useApi";
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
   * Returns the document as a blob for download
   */
  generateDocument: async (
    filename: string,
    context: Record<string, unknown>
  ): Promise<void> => {
    const request: GenerateDocRequest = { filename, context };
    
    const blob = await api.post<Blob>(API_ENDPOINTS.GENERATE_DOC, request);
    
    // Extract filename from the original template name
    const downloadFilename = filename.replace(/\.docx$/i, "_generated.docx");
    
    downloadBlob(blob, downloadFilename);
  },
};

export default documentGeneratorApi;
