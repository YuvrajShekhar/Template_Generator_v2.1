import * as React from "react";
import {
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui";
import { ErrorMessage } from "@shared/components/feedback";
import { cn } from "@shared/utils/cn";
import { snakeToTitleCase } from "@shared/utils/formatters";
import type { Placeholder, FormFieldValue } from "../types";

interface FormFieldProps {
  placeholder: Placeholder;
  value: FormFieldValue;
  onChange: (name: string, value: FormFieldValue) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  placeholder,
  value,
  onChange,
  error,
  disabled,
  className,
}: FormFieldProps) {
  const { name, type, values, optional, hidden } = placeholder;

  // Don't render hidden fields
  if (hidden) return null;

  // Generate label from name
  const label = placeholder.label || snakeToTitleCase(name);

  const handleChange = (newValue: FormFieldValue) => {
    onChange(name, newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label - not shown for checkbox (included inline) */}
      {type !== "boolean" && (
        <Label htmlFor={name} required={!optional} error={!!error}>
          {label}
        </Label>
      )}

      {/* Field based on type */}
      {type === "enum" && values ? (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => handleChange(v)}
          disabled={disabled}
        >
          <SelectTrigger id={name} error={!!error}>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {values.map((v) => (
              <SelectItem key={String(v)} value={String(v)}>
                {String(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "boolean" ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(Boolean(checked))}
            disabled={disabled}
          />
          <Label htmlFor={name} className="font-normal cursor-pointer">
            {label}
          </Label>
        </div>
      ) : type === "date" ? (
        <Input
          id={name}
          type="date"
          value={String(value ?? "")}
          onChange={(e) => handleChange(e.target.value)}
          error={!!error}
          disabled={disabled}
        />
      ) : type === "number" ? (
        <Input
          id={name}
          type="number"
          value={String(value ?? "")}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          error={!!error}
          disabled={disabled}
        />
      ) : (
        <Input
          id={name}
          type="text"
          value={String(value ?? "")}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          error={!!error}
          disabled={disabled}
        />
      )}

      {/* Error message */}
      <ErrorMessage message={error} />

      {/* Description if available */}
      {placeholder.description && !error && (
        <p className="text-xs text-muted-foreground">
          {placeholder.description}
        </p>
      )}
    </div>
  );
}
