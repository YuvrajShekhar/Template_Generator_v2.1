import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@app/layout";
import { ProtectedRoute } from "@features/auth";

// Lazy load feature pages for better performance
const LoginPage = React.lazy(
  () => import("@features/auth/pages/LoginPage")
);
const TemplateSelectionPage = React.lazy(
  () => import("@features/document-generator/pages/TemplateSelectionPage")
);
const DocumentFormPage = React.lazy(
  () => import("@features/document-generator/pages/DocumentFormPage")
);
const ValidatorPage = React.lazy(
  () => import("@features/document-validator/pages/ValidatorPage")
);

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to generator */}
          <Route path="/" element={<Navigate to="/generator" replace />} />

          {/* Document Generator routes */}
          <Route path="/generator">
            <Route index element={<TemplateSelectionPage />} />
            <Route path=":filename" element={<DocumentFormPage />} />
            <Route path=":filename/:provider" element={<DocumentFormPage />} />
          </Route>

          {/* Document Validator routes */}
          <Route path="/validator" element={<ValidatorPage />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </React.Suspense>
  );
}