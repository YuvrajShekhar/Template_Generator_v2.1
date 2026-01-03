import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentGeneratorApi } from "../services/documentGeneratorApi";

interface GenerateDocumentParams {
  filename: string;
  context: Record<string, unknown>;
}

/**
 * Hook to generate a document from a template
 */
export function useDocumentGeneration() {
  return useMutation({
    mutationFn: async ({ filename, context }: GenerateDocumentParams) => {
      return documentGeneratorApi.generateDocument(filename, context);
    },
    onSuccess: () => {
      toast.success("Document generated successfully!", {
        description: "Your download should start automatically.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to generate document", {
        description: error.message || "Please try again.",
      });
    },
  });
}
