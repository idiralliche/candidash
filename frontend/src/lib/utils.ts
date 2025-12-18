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

/**
 * Generic helper to find an entity by its ID in a list.
 *
 * @param entities -array of entities with an 'id' property
 * @param id - ID to search for (number or string)
 * @returns the found entity or undefined if not found
 */
export function findEntityById<T extends { id: number }>(entities: T[] | undefined, id: number | string | null | undefined): T | undefined {
  if (!entities || !id) return undefined;
  const numId = Number(id);
  if (isNaN(numId)) return undefined;
  return entities.find(item => item.id === numId);
}

/**
 * Formats a number of bytes into a human-readable string (e.g., "1.5 MB").
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
