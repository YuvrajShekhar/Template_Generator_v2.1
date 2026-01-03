import * as React from "react";
import { motion } from "framer-motion";
import { FileCheck, RotateCcw } from "lucide-react";
import { Button } from "@shared/components/ui";
import { useValidation } from "../hooks";
import { DropZone, ValidationResults, ExportMenu } from "../components";

export default function ValidatorPage() {
  const { validate, result, isValidating, reset } = useValidation();

  const handleFile = (file: File) => {
    validate(file);
  };

  const handleReset = () => {
    reset();
  };

  // Transform result for export (use raw issues array)
  const exportResult = result
    ? {
        filename: result.filename,
        ok: result.ok,
        issues: result.issues,
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Document Validator
            </h1>
          </div>
          <p className="text-muted-foreground">
            Upload a .docx template to validate its structure and placeholders
          </p>
        </div>

        {/* Action buttons */}
        {result && (
          <div className="flex items-center gap-2">
            <ExportMenu result={exportResult!} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Validate Another
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <DropZone onFile={handleFile} isLoading={isValidating} />

      {/* Validation Results */}
      <ValidationResults result={result} />
    </motion.div>
  );
}
