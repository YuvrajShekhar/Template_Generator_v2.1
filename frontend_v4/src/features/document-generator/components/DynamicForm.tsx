import * as React from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Separator,
} from "@shared/components/ui";
import { cn } from "@shared/utils/cn";
import { FormField } from "./FormField";
import type {
  Placeholder,
  LayoutGroup,
  FormValues,
  FormFieldValue,
} from "../types";

interface DynamicFormProps {
  placeholders: Placeholder[];
  layout: LayoutGroup[];
  values: FormValues;
  onChange: (name: string, value: FormFieldValue) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
  className?: string;
}

export function DynamicForm({
  placeholders,
  layout,
  values,
  onChange,
  onSubmit,
  onReset,
  isSubmitting = false,
  errors = {},
  className,
}: DynamicFormProps) {
  // Create placeholder map for quick lookup
  const placeholderMap = React.useMemo(() => {
    const map = new Map<string, Placeholder>();
    placeholders.forEach((ph) => map.set(ph.name, ph));
    return map;
  }, [placeholders]);

  // Get placeholders that aren't in any layout group
  const ungroupedPlaceholders = React.useMemo(() => {
    const layoutNames = new Set<string>();
    layout.forEach((group) => {
      group.rows.forEach((row) => {
        row.forEach((name) => layoutNames.add(name));
      });
    });
    return placeholders.filter(
      (ph) => !layoutNames.has(ph.name) && !ph.hidden
    );
  }, [placeholders, layout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Animation variants for staggered form appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Render layout groups */}
        {layout.map((group, groupIndex) => (
          <motion.div key={group.group || groupIndex} variants={itemVariants}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{group.group}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={cn(
                      "grid gap-4",
                      row.length === 1
                        ? "grid-cols-1"
                        : row.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : row.length === 3
                        ? "grid-cols-1 md:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    )}
                  >
                    {row.map((fieldName) => {
                      const placeholder = placeholderMap.get(fieldName);
                      if (!placeholder) return null;

                      return (
                        <FormField
                          key={fieldName}
                          placeholder={placeholder}
                          value={values[fieldName]}
                          onChange={onChange}
                          error={errors[fieldName]}
                          disabled={isSubmitting}
                        />
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Render ungrouped placeholders */}
        {ungroupedPlaceholders.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  {layout.length > 0 ? "Additional Fields" : "Document Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {ungroupedPlaceholders.map((placeholder) => (
                    <FormField
                      key={placeholder.name}
                      placeholder={placeholder}
                      value={values[placeholder.name]}
                      onChange={onChange}
                      error={errors[placeholder.name]}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <Separator />
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSubmitting}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Reset Form
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Generate Document
        </Button>
      </div>
    </form>
  );
}
