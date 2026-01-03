import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentValidatorApi } from "../services/documentValidatorApi";
import type {
  ValidationResponse,
  ValidationIssue,
  NormalizedValidationResult,
} from "../types";

/**
 * Normalize validation response for consistent display
 */
function normalizeValidationResult(
  response: ValidationResponse
): NormalizedValidationResult {
  // Handle nested issues structure
  let issues: ValidationIssue[] = [];
  
  if (Array.isArray(response.issues)) {
    issues = response.issues;
  } else if (response.issues && "issues" in response.issues) {
    issues = response.issues.issues ?? [];
  }

  // Calculate stats
  const stats = {
    total: issues.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warn").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return {
    ok: response.ok,
    filename: response.filename,
    issues,
    summary: response.summary,
    stats,
  };
}

/**
 * Hook to validate a document file
 */
export function useValidation() {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await documentValidatorApi.validateDocument(file);
      return normalizeValidationResult(response);
    },
    onSuccess: (data) => {
      if (data.ok && data.stats.errors === 0) {
        toast.success("Validation complete!", {
          description: `No errors found in ${data.filename}`,
        });
      } else if (data.stats.errors > 0) {
        toast.error("Validation issues found", {
          description: `${data.stats.errors} error(s) in ${data.filename}`,
        });
      } else {
        toast.warning("Validation complete", {
          description: `${data.stats.warnings} warning(s) in ${data.filename}`,
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Validation failed", {
        description: error.message || "Could not validate the file.",
      });
    },
  });

  return {
    validate: mutation.mutate,
    validateAsync: mutation.mutateAsync,
    result: mutation.data,
    isValidating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
