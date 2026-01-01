import { api } from "@shared/hooks/useApi";
import { API_ENDPOINTS } from "@shared/constants/api";
import type { ValidationResponse } from "../types";

/**
 * Document Validator API Service
 */
export const documentValidatorApi = {
  /**
   * Validate a document file
   */
  validateDocument: async (file: File): Promise<ValidationResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ValidationResponse>(API_ENDPOINTS.VALIDATE_DOC, formData);
  },
};

export default documentValidatorApi;
