import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a snake_case enum string to Title Case.
 * Example: "job_posting" -> "Job Posting"
 */
export function formatEnum(value: string | null | undefined): string {
  if (!value) return '';
  // Replace underscores with spaces and capitalize first letter of each word
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
