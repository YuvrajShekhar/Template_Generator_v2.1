import { z } from "zod";
import type { Placeholder, PlaceholderType } from "../types";

/**
 * Create a Zod schema for a single placeholder based on its type
 */
function createFieldSchema(placeholder: Placeholder): z.ZodTypeAny {
  const { type, optional, values, name } = placeholder;

  let schema: z.ZodTypeAny;

  switch (type) {
    case "string":
      schema = z.string();
      if (!optional) {
        schema = (schema as z.ZodString).min(1, `${name} is required`);
      }
      break;

    case "number":
      schema = z.coerce.number({
        invalid_type_error: `${name} must be a number`,
      });
      if (!optional) {
        schema = (schema as z.ZodNumber).min(0, `${name} is required`);
      }
      break;

    case "date":
      schema = z.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        `${name} must be a valid date`
      );
      if (!optional) {
        schema = (schema as z.ZodString).min(1, `${name} is required`);
      }
      break;

    case "boolean":
      schema = z.boolean();
      break;

    case "enum":
      if (values && values.length > 0) {
        const stringValues = values.map(String);
        schema = z.enum(stringValues as [string, ...string[]], {
          errorMap: () => ({ message: `${name} must be one of: ${stringValues.join(", ")}` }),
        });
      } else {
        schema = z.string();
      }
      if (!optional) {
        schema = (schema as z.ZodString).min(1, `${name} is required`);
      }
      break;

    default:
      schema = z.string();
      if (!optional) {
        schema = (schema as z.ZodString).min(1, `${name} is required`);
      }
  }

  // Make optional if needed
  if (optional) {
    schema = schema.optional().or(z.literal(""));
  }

  return schema;
}

/**
 * Create a dynamic Zod schema from an array of placeholders
 */
export function createFormSchema(placeholders: Placeholder[]) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  placeholders.forEach((placeholder) => {
    // Skip hidden fields
    if (placeholder.hidden) return;
    
    schemaShape[placeholder.name] = createFieldSchema(placeholder);
  });

  return z.object(schemaShape);
}

/**
 * Validate form values against placeholders
 */
export function validateFormValues(
  placeholders: Placeholder[],
  values: Record<string, unknown>
): { success: boolean; errors: Record<string, string> } {
  const schema = createFormSchema(placeholders);
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path[0];
    if (typeof path === "string") {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName];
}

/**
 * Type-safe form data type
 */
export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
