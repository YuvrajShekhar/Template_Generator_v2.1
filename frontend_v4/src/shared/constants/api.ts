/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * API Endpoints - Note: Django requires trailing slashes
 */
export const API_ENDPOINTS = {
  // Templates
  TEMPLATES: "/api/templates/",
  PLACEHOLDERS: "/api/placeholders/",
  GENERATE_DOC: "/api/generateDoc/",
  
  // Validator
  VALIDATE_DOC: "/api/validateDoc/",
} as const;

/**
 * Query Keys for TanStack Query
 */
export const QUERY_KEYS = {
  templates: ["templates"] as const,
  placeholders: (filename: string) => ["placeholders", filename] as const,
  validation: (filename: string) => ["validation", filename] as const,
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
