/**
 * Placeholder field types supported by the system
 */
export type PlaceholderType = "string" | "number" | "enum" | "date" | "boolean";

/**
 * Placeholder definition from template
 */
export interface Placeholder {
  name: string;
  type: PlaceholderType;
  values?: Array<string | number>;
  optional?: boolean;
  offset?: number;
  hidden?: boolean;
  label?: string;
  description?: string;
}

/**
 * Template metadata
 */
export interface TemplateMeta {
  provider?: string[];
  category?: string[];
  tags?: string[];
  version?: string;
  creator?: string;
  name?: string;
  description?: string;
}

/**
 * Layout group for organizing form fields
 */
export interface LayoutGroup {
  group: string;
  rows: string[][];
}

/**
 * Template item in the list
 */
export interface TemplateItem {
  filename: string;
  meta: TemplateMeta;
}

/**
 * API Response: Template list
 */
export interface TemplatesResponse {
  files: TemplateItem[];
}

/**
 * API Response: Placeholders for a template
 */
export interface PlaceholdersResponse {
  placeholders: Placeholder[];
  meta: TemplateMeta;
  layout: LayoutGroup[];
}

/**
 * Request body for generating a document
 */
export interface GenerateDocRequest {
  filename: string;
  context: Record<string, unknown>;
}

/**
 * Filter state for template list
 */
export interface TemplateFilters {
  provider: string;
  category: string;
  search: string;
  tags: string[];
}

/**
 * Form field value types
 */
export type FormFieldValue = string | number | boolean | undefined;

/**
 * Form values object
 */
export type FormValues = Record<string, FormFieldValue>;
