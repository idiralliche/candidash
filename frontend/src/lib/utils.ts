import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EventStatus } from '@/api/model';

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

/*
 * Converts an ISO date string (API) to a local datetime-local string.
 * Example: "2023-12-25T14:00:00Z" -> "2023-12-25T15:00" (if UTC+1)
 */
export function toLocalISOString(dateString?: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);

  return localISOTime;
}

/*
 * Determines the badge variant (color classes) based on event status.
 */
export function getStatusBadgeVariant(status?: EventStatus) {
  const currentStatus = status || EventStatus.pending;

  switch (currentStatus) {
    case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'rescheduled': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}
