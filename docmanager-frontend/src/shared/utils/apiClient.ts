import { API_CONFIG } from "@shared/constants/api";

/**
 * Custom API Error class with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public url: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromResponse(response: Response, message?: string): ApiError {
    const retryable = response.status >= 500 || response.status === 429;
    return new ApiError(
      message || `Request failed: ${response.statusText}`,
      response.status,
      response.statusText,
      response.url,
      retryable
    );
  }
}

/**
 * Network Error for connection failures
 */
export class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends Error {
  constructor(message: string = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryOn: (error: Error) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: (error) => {
    if (error instanceof ApiError) {
      return error.retryable;
    }
    if (error instanceof NetworkError) {
      return true;
    }
    return false;
  },
};

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Enhanced fetch with retry logic
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        options,
        API_CONFIG.TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw ApiError.fromResponse(response, errorText || undefined);
      }

      // Handle different response types
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
      }
      
      return response as unknown as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry =
        attempt < config.maxRetries && config.retryOn(lastError);

      if (shouldRetry) {
        const delay = getRetryDelay(attempt, config);
        console.warn(
          `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries})`,
          lastError.message
        );
        await sleep(delay);
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Authentication required. Please log in.";
      case 403:
        return "You don't have permission to access this resource.";
      case 404:
        return "The requested resource was not found.";
      case 413:
        return "The file is too large to upload.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  if (error instanceof NetworkError) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (error instanceof TimeoutError) {
    return "The request took too long. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  if (error instanceof NetworkError) {
    return true;
  }
  return false;
}
