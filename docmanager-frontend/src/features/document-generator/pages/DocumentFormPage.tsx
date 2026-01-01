import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@shared/components/ui";
import { LoadingState, ErrorState } from "@shared/components/feedback";
import {
  usePlaceholders,
  useDocumentGeneration,
  getInitialFormValues,
  formValuesToContext,
  useRecentTemplates,
} from "../hooks";
import { TemplateHeader, DynamicForm } from "../components";
import type { FormFieldValue, FormValues } from "../types";

export default function DocumentFormPage() {
  const { filename, provider } = useParams<{ filename: string; provider?: string }>();
  const navigate = useNavigate();
  
  // Decode URL params
  const decodedFilename = filename ? decodeURIComponent(filename) : "";
  const decodedProvider = provider ? decodeURIComponent(provider) : undefined;

  // Fetch placeholders for this template
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePlaceholders(decodedFilename);

  // Document generation mutation
  const generateMutation = useDocumentGeneration();

  // Recent templates tracking
  const { addRecent } = useRecentTemplates();

  // Form values state
  const [formValues, setFormValues] = React.useState<FormValues>({});
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Initialize form values when placeholders are loaded
  React.useEffect(() => {
    if (data?.placeholders) {
      // Process placeholders - handle PROVIDER specially
      const processedPlaceholders = data.placeholders.map((ph) => {
        if (ph.name === "PROVIDER" && decodedProvider) {
          return { ...ph, hidden: true };
        }
        if (ph.name === "PROVIDER" && !decodedProvider && data.meta.provider) {
          return { ...ph, type: "enum" as const, values: data.meta.provider };
        }
        return ph;
      });

      const initialValues = getInitialFormValues(processedPlaceholders, decodedProvider);
      setFormValues(initialValues);

      // Track as recent template
      addRecent({
        filename: decodedFilename,
        name: data.meta.name || decodedFilename,
        provider: decodedProvider,
      });
    }
  }, [data, decodedProvider, decodedFilename, addRecent]);

  // Handle field change
  const handleFieldChange = (name: string, value: FormFieldValue) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!data?.placeholders) return false;

    const errors: Record<string, string> = {};

    data.placeholders.forEach((ph) => {
      if (ph.hidden) return;
      if (ph.optional) return;

      const value = formValues[ph.name];

      // Check required fields
      if (value === undefined || value === "" || value === null) {
        errors[ph.name] = "This field is required";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !data?.placeholders) return;

    const context = formValuesToContext(formValues, data.placeholders);

    try {
      await generateMutation.mutateAsync({
        filename: decodedFilename,
        context,
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (data?.placeholders) {
      const initialValues = getInitialFormValues(data.placeholders, decodedProvider);
      setFormValues(initialValues);
      setFormErrors({});
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Back link */}
        <Link
          to="/generator"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>

        <LoadingState message="Loading template..." />
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="space-y-6">
        {/* Back link */}
        <Link
          to="/generator"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>

        <ErrorState
          title="Failed to load template"
          message={error?.message || "Could not load the template placeholders."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Process placeholders for display (hide PROVIDER if selected via URL)
  const displayPlaceholders = data.placeholders.map((ph) => {
    if (ph.name === "PROVIDER" && decodedProvider) {
      return { ...ph, hidden: true };
    }
    if (ph.name === "PROVIDER" && !decodedProvider && data.meta.provider) {
      return { ...ph, type: "enum" as const, values: data.meta.provider };
    }
    return ph;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/generator"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/generator")}
        >
          Choose different template
        </Button>
      </div>

      {/* Template Header */}
      <TemplateHeader
        filename={decodedFilename}
        meta={data.meta}
        provider={decodedProvider}
      />

      {/* Dynamic Form */}
      <DynamicForm
        placeholders={displayPlaceholders}
        layout={data.layout}
        values={formValues}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={generateMutation.isPending}
        errors={formErrors}
      />
    </motion.div>
  );
}
