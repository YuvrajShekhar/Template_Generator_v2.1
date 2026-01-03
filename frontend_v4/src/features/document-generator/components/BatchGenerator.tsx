import * as React from "react";
import {
  Plus,
  Trash2,
  Play,
  Square,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge, Input, Separator } from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import { useBatchGeneration } from "../hooks/useBatchGeneration";
import type { Placeholder } from "../types";
import type { BatchItem } from "../types/batch";

interface BatchGeneratorProps {
  templateFilename: string;
  placeholders: Placeholder[];
  onClose?: () => void;
}

/**
 * Batch document generation interface
 */
export function BatchGenerator({
  templateFilename,
  placeholders,
  onClose,
}: BatchGeneratorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showImportHelp, setShowImportHelp] = React.useState(false);

  const {
    items,
    isGenerating,
    progress,
    completedCount,
    errorCount,
    pendingCount,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    generateAll,
    cancelGeneration,
    importFromCSV,
  } = useBatchGeneration(templateFilename);

  // Filter to editable placeholders
  const editablePlaceholders = placeholders.filter((p) => !p.hidden);

  /**
   * Add empty row
   */
  const handleAddRow = () => {
    const defaultValues: Record<string, unknown> = {};
    editablePlaceholders.forEach((p) => {
      if (p.type === "boolean") {
        defaultValues[p.name] = false;
      } else if (p.type === "enum" && p.values?.length) {
        defaultValues[p.name] = p.values[0];
      } else {
        defaultValues[p.name] = "";
      }
    });
    addItem(defaultValues);
  };

  /**
   * Handle CSV import
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importFromCSV(content);
        if (!result.success && result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Download CSV template
   */
  const downloadTemplate = () => {
    const headers = editablePlaceholders.map((p) => p.name).join(",");
    const exampleRow = editablePlaceholders
      .map((p) => {
        if (p.type === "enum" && p.values?.length) return p.values[0];
        if (p.type === "date") return new Date().toISOString().split("T")[0];
        if (p.type === "number") return "0";
        if (p.type === "boolean") return "false";
        return `Example ${p.name}`;
      })
      .join(",");

    const csv = `${headers}\n${exampleRow}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-template-${templateFilename.replace(".docx", "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Batch Generation</h2>
          <p className="text-sm text-muted-foreground">
            Generate multiple documents at once
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            leftIcon={<Download className="h-4 w-4" />}
          >
            CSV Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Import CSV
          </Button>
        </div>
      </div>

      {/* Import Help */}
      <button
        onClick={() => setShowImportHelp(!showImportHelp)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <AlertCircle className="h-4 w-4" />
        How to import from CSV
      </button>
      
      <AnimatePresence>
        {showImportHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm">
              <p className="mb-2">
                <strong>CSV Format:</strong> First row should contain field names matching the template placeholders.
              </p>
              <p className="mb-2">
                <strong>Example:</strong>
              </p>
              <pre className="bg-background rounded p-2 text-xs overflow-x-auto">
                {editablePlaceholders.map((p) => p.name).join(",")}{"\n"}
                {editablePlaceholders.map((p) => `value1`).join(",")}
              </pre>
              <p className="mt-2 text-muted-foreground">
                Download the CSV template for the correct format.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Generating documents...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{pendingCount} pending</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>{completedCount} completed</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{errorCount} failed</span>
            </div>
          )}
        </div>
      )}

      <Separator className="my-4" />

      {/* Batch Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium w-10">#</th>
              {editablePlaceholders.slice(0, 4).map((p) => (
                <th key={p.name} className="text-left py-2 px-2 font-medium">
                  {p.name}
                </th>
              ))}
              {editablePlaceholders.length > 4 && (
                <th className="text-left py-2 px-2 font-medium">
                  +{editablePlaceholders.length - 4} more
                </th>
              )}
              <th className="text-left py-2 px-2 font-medium w-24">Status</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, index) => (
                <BatchRow
                  key={item.id}
                  item={item}
                  index={index}
                  placeholders={editablePlaceholders}
                  onUpdate={(values) => updateItem(item.id, values)}
                  onRemove={() => removeItem(item.id)}
                  disabled={isGenerating}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No items in batch</p>
            <p className="text-sm">Add items manually or import from CSV</p>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={isGenerating}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Row
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearItems}
              disabled={isGenerating}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Close
            </Button>
          )}
          {isGenerating ? (
            <Button
              variant="destructive"
              onClick={cancelGeneration}
              leftIcon={<Square className="h-4 w-4" />}
            >
              Stop
            </Button>
          ) : (
            <Button
              onClick={generateAll}
              disabled={items.length === 0 || pendingCount === 0}
              leftIcon={<Play className="h-4 w-4" />}
            >
              Generate All ({pendingCount})
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Individual batch row
 */
function BatchRow({
  item,
  index,
  placeholders,
  onUpdate,
  onRemove,
  disabled,
}: {
  item: BatchItem;
  index: number;
  placeholders: Placeholder[];
  onUpdate: (values: Record<string, unknown>) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const handleChange = (name: string, value: unknown) => {
    onUpdate({ ...item.values, [name]: value });
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    generating: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    error: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "border-b",
        item.status === "error" && "bg-destructive/5",
        item.status === "success" && "bg-green-50 dark:bg-green-900/10"
      )}
    >
      <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
      {placeholders.slice(0, 4).map((p) => (
        <td key={p.name} className="py-2 px-2">
          <Input
            type={p.type === "number" ? "number" : p.type === "date" ? "date" : "text"}
            value={String(item.values[p.name] || "")}
            onChange={(e) => handleChange(p.name, e.target.value)}
            disabled={disabled || item.status !== "pending"}
            className="h-8 text-sm"
          />
        </td>
      ))}
      {placeholders.length > 4 && (
        <td className="py-2 px-2">
          <Badge variant="secondary" className="text-xs">
            {placeholders.length - 4} fields
          </Badge>
        </td>
      )}
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          {statusIcons[item.status]}
          <span className="text-xs capitalize">{item.status}</span>
        </div>
        {item.error && (
          <p className="text-xs text-destructive mt-1 truncate max-w-32" title={item.error}>
            {item.error}
          </p>
        )}
      </td>
      <td className="py-2 px-2">
        <button
          onClick={onRemove}
          disabled={disabled}
          className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </td>
    </motion.tr>
  );
}
