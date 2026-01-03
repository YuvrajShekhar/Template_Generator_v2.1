/**
 * Batch Generation Types
 */

export interface BatchItem {
  id: string;
  values: Record<string, unknown>;
  status: "pending" | "generating" | "success" | "error";
  error?: string;
  filename?: string;
}

export interface BatchGenerationState {
  items: BatchItem[];
  templateFilename: string;
  isGenerating: boolean;
  progress: number;
  completedCount: number;
  errorCount: number;
}

export interface BatchImportResult {
  success: boolean;
  items: Record<string, unknown>[];
  errors: string[];
}
