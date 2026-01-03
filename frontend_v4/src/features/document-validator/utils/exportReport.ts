/**
 * Export utilities for validation reports
 */

import type { ValidationResult, ValidationIssue } from "../types";

/**
 * Export validation results as CSV
 */
export function exportAsCSV(result: ValidationResult): string {
  const headers = [
    "Severity",
    "Code",
    "Title",
    "Message",
    "Hint",
    "Paragraph",
    "Span Start",
    "Span End",
    "Excerpt",
  ];

  const rows = result.issues.map((issue) => [
    issue.severity,
    issue.code,
    issue.title || "",
    issue.message || "",
    issue.hint || "",
    issue.location?.paragraph?.toString() || "",
    issue.location?.span?.[0]?.toString() || "",
    issue.location?.span?.[1]?.toString() || "",
    issue.excerpt || "",
  ]);

  const escapeCSV = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export validation results as JSON
 */
export function exportAsJSON(result: ValidationResult): string {
  return JSON.stringify(
    {
      filename: result.filename,
      validatedAt: new Date().toISOString(),
      summary: {
        total: result.issues.length,
        errors: result.issues.filter((i) => i.severity === "error").length,
        warnings: result.issues.filter((i) => i.severity === "warn").length,
        info: result.issues.filter((i) => i.severity === "info").length,
      },
      issues: result.issues,
    },
    null,
    2
  );
}

/**
 * Generate HTML report
 */
export function exportAsHTML(result: ValidationResult): string {
  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warnCount = result.issues.filter((i) => i.severity === "warn").length;
  const infoCount = result.issues.filter((i) => i.severity === "info").length;

  const severityColors = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
  };

  const issueRows = result.issues
    .map(
      (issue) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <span style="
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background: ${severityColors[issue.severity]}20;
          color: ${severityColors[issue.severity]};
        ">
          ${issue.severity.toUpperCase()}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">
        ${issue.code}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <strong>${issue.title || ""}</strong>
        ${issue.message ? `<br><span style="color: #6b7280; font-size: 13px;">${issue.message}</span>` : ""}
        ${issue.hint ? `<br><span style="color: #3b82f6; font-size: 12px;">💡 ${issue.hint}</span>` : ""}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        ${issue.location?.paragraph ? `Paragraph ${issue.location.paragraph}` : "-"}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${
          issue.excerpt
            ? `<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px; font-size: 11px;">${issue.excerpt}</code>`
            : "-"
        }
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validation Report - ${result.filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #1f2937;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 24px; }
    .summary { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 32px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
    }
    .summary-count { font-size: 24px; font-weight: 600; }
    .summary-label { font-size: 14px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; }
    th { 
      text-align: left; 
      padding: 12px 8px; 
      border-bottom: 2px solid #e5e7eb;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <h1>📋 Validation Report</h1>
  <p class="subtitle">${result.filename} • Generated ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-item" style="background: ${severityColors.error}10;">
      <div>
        <div class="summary-count" style="color: ${severityColors.error};">${errorCount}</div>
        <div class="summary-label">Errors</div>
      </div>
    </div>
    <div class="summary-item" style="background: ${severityColors.warn}10;">
      <div>
        <div class="summary-count" style="color: ${severityColors.warn};">${warnCount}</div>
        <div class="summary-label">Warnings</div>
      </div>
    </div>
    <div class="summary-item" style="background: ${severityColors.info}10;">
      <div>
        <div class="summary-count" style="color: ${severityColors.info};">${infoCount}</div>
        <div class="summary-label">Info</div>
      </div>
    </div>
    <div class="summary-item" style="background: #f3f4f6;">
      <div>
        <div class="summary-count">${result.issues.length}</div>
        <div class="summary-label">Total Issues</div>
      </div>
    </div>
  </div>

  ${
    result.issues.length > 0
      ? `
  <table>
    <thead>
      <tr>
        <th style="width: 80px;">Severity</th>
        <th style="width: 120px;">Code</th>
        <th>Details</th>
        <th style="width: 100px;">Location</th>
        <th style="width: 200px;">Excerpt</th>
      </tr>
    </thead>
    <tbody>
      ${issueRows}
    </tbody>
  </table>
  `
      : `
  <div style="text-align: center; padding: 48px; color: #6b7280;">
    <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
    <p style="font-size: 18px;">No issues found!</p>
    <p>This document passed all validation checks.</p>
  </div>
  `
  }

  <div class="footer">
    Generated by DocManager Validator
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download file helper
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export validation report in specified format
 */
export function exportValidationReport(
  result: ValidationResult,
  format: "csv" | "json" | "html"
): void {
  const baseFilename = result.filename.replace(/\.[^/.]+$/, "");
  const timestamp = new Date().toISOString().slice(0, 10);

  switch (format) {
    case "csv":
      downloadFile(
        exportAsCSV(result),
        `${baseFilename}-validation-${timestamp}.csv`,
        "text/csv"
      );
      break;
    case "json":
      downloadFile(
        exportAsJSON(result),
        `${baseFilename}-validation-${timestamp}.json`,
        "application/json"
      );
      break;
    case "html":
      downloadFile(
        exportAsHTML(result),
        `${baseFilename}-validation-${timestamp}.html`,
        "text/html"
      );
      break;
  }
}
