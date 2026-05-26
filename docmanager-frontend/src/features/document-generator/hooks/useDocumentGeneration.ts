import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentGeneratorApi } from "../services/documentGeneratorApi";

interface GenerateDocumentParams {
  filename: string;
  context: Record<string, unknown>;
}

/**
 * Hook to generate a document from a template
 * Returns the blob via mutateAsync for preview/print/download
 */
export function useDocumentGeneration() {
  return useMutation<Blob, Error, GenerateDocumentParams>({
    mutationFn: ({ filename, context }) =>
      documentGeneratorApi.generateDocument(filename, context),
    onError: (error: Error) => {
      toast.error("Failed to generate document", {
        description: error.message || "Please try again.",
      });
    },
  });
}
