import { EventStatus, DocumentFormat } from '@/api/model';

// We extract the Palette type directly from the implementation logic
// or define it manually to match badge.tsx possibilities.
export type UiPalette =
  | "default"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "yellow"
  | "sky"
  | "indigo";

/**
 * =========================================================
 * EVENT STATUS MAPPING
 * Maps business logic statuses to UI colors.
 * =========================================================
 */
export const STATUS_COLOR: Record<EventStatus, UiPalette> = {
  confirmed: 'green',     // Success/Go
  completed: 'blue',      // Done/Info
  cancelled: 'red',       // Danger/Stop
  rescheduled: 'orange',  // Warning/Change
  pending: 'gray',        // Neutral/Waiting
};

/**
 * =========================================================
 * DOCUMENT FORMAT MAPPING
 * Maps file extensions to brand colors (e.g., Word=Blue, PDF=Red).
 * =========================================================
 */
export const FORMAT_COLOR: Record<DocumentFormat, UiPalette> = {
  // Adobe Acrobat / PDF
  pdf: 'red',

  // Microsoft Office
  doc: 'blue',
  docx: 'blue',
  xls: 'green',
  xlsx: 'green',
  ppt: 'orange',
  pptx: 'orange',

  // OpenOffice / LibreOffice
  odt: 'indigo',
  ods: 'green',
  odp: 'orange',

  // Data & Code
  csv: 'green',
  tsv: 'green',
  json: 'gray',

  // Images
  jpg: 'yellow',
  jpeg: 'yellow',
  png: 'yellow',
  gif: 'yellow',
  webp: 'yellow',

  // Text
  txt: 'gray',
  rtf: 'gray',
  md: 'gray',

  // External
  external: 'sky',
};

/**
 * Helper to get status color safely with fallback
 */
export function getStatusPalette(status?: EventStatus): UiPalette {
  return STATUS_COLOR[status || 'pending'];
}

/**
 * Helper to get format color safely with fallback
 */
export function getFormatPalette(format?: DocumentFormat): UiPalette {
  return FORMAT_COLOR[format || 'txt'] || 'gray';
}
