/**
 * Format a date string to German locale format (DD.MM.YYYY)
 */
export function formatDateDE(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a date string to ISO format (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0] ?? "";
}

/**
 * Convert ISO date to German format
 */
export function isoToGermanDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

/**
 * Convert German date to ISO format
 */
export function germanToISODate(germanDate: string): string {
  if (!germanDate) return "";
  const [day, month, year] = germanDate.split(".");
  return `${year}-${month}-${day}`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert snake_case or SCREAMING_SNAKE_CASE to Title Case
 */
export function snakeToTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate a string to a specified length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDateDE(d);
}
