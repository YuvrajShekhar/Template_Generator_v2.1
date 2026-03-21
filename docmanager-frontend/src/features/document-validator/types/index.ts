/**
 * Severity levels for validation issues
 */
export type IssueSeverity = "error" | "warn" | "info";
import type { PlaceholderType } from "@features/document-generator/types";
/**
 * Location of an issue in the document
 */
export interface IssueLocation {
  paragraph?: number;
  span?: [number, number];
}

/**
 * Validation issue from the validator
 */
export interface ValidationIssue {
  severity: IssueSeverity;
  code: string;
  title?: string;
  message?: string;
  location?: IssueLocation;
  hint?: string;
  excerpt?: string;
  params?: Record<string, string>;
}

/**
 * API Response: Validation result
 */
export interface ValidationResponse {
  ok: boolean;
  filename: string;
  issues: ValidationIssue[] | { issues?: ValidationIssue[] };
  summary?: Record<string, unknown>;
}

/**
 * Normalized validation result for display
 */
export interface NormalizedValidationResult {
  ok: boolean;
  filename: string;
  issues: ValidationIssue[];
  summary?: Record<string, unknown>;
  stats: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

export interface Placeholder {
  name: string;
  type: PlaceholderType;
  values?: Array<string | number>;
  optional?: boolean;
  offset?: number;
  min_offset?: number;           // NEW: minimum date = anchor field date + this offset
  require_one_of?: string[];     // NEW: at least one field in this group must be filled
  hidden?: boolean;
  label?: string;
  description?: string;
}

/**
 * Validation state
 */
export type ValidationState = "idle" | "uploading" | "validating" | "success" | "error";
