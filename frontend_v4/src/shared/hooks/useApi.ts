import { API_CONFIG } from "@shared/constants/api";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Request options type
 */
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | FormData;
}

/**
 * Base fetch function with error handling
 */
async function baseFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const isFormData = body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  const config: RequestInit = {
    ...restOptions,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.text().catch(() => "");
    throw new ApiError(
      errorData || response.statusText,
      response.status,
      response.statusText,
      errorData
    );
  }

  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  // Return blob for file downloads
  return response.blob() as unknown as T;
}

/**
 * API helper object with HTTP methods
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: RequestOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    baseFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
