import * as React from "react";
import { Download, FileText, FileJson, FileCode, ChevronDown } from "lucide-react";
import { Button } from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import { exportValidationReport } from "../utils/exportReport";
import type { ValidationResult } from "../types";

interface ExportMenuProps {
  result: ValidationResult;
  disabled?: boolean;
}

type ExportFormat = "csv" | "json" | "html";

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    format: "html",
    label: "HTML Report",
    description: "Formatted report for viewing/printing",
    icon: <FileCode className="h-4 w-4" />,
  },
  {
    format: "csv",
    label: "CSV Spreadsheet",
    description: "For Excel or Google Sheets",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    format: "json",
    label: "JSON Data",
    description: "For programmatic use",
    icon: <FileJson className="h-4 w-4" />,
  },
];

/**
 * Export menu dropdown for validation results
 */
export function ExportMenu({ result, disabled }: ExportMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleExport = (format: ExportFormat) => {
    exportValidationReport(result, format);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        }
      >
        Export Report
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg z-50 py-1">
          {exportOptions.map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 text-muted-foreground">{option.icon}</div>
              <div>
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
