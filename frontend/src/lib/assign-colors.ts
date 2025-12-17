import { EventStatus } from '@/api/model';
import { DocumentFormat } from '@/api/model';

// =============================================
// Tailwind Static mappings
// =============================================

type ColorVariant = {
  badge: string; // Lighter text for badges (400)
  icon: string;  // Stronger text for icons (500)
};

const COLOR_STYLES: Record<string, ColorVariant> = {
  sky: {
    badge: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    icon: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  },
  red: {
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  indigo: {
    badge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    icon: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  orange: {
    badge: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    icon: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  green: {
    badge: "text-green-400 bg-green-500/10 border-green-500/20",
    icon: "text-green-500 bg-green-500/10 border-green-500/20",
  },
  yellow: {
    badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    icon: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  },
  gray: {
    badge: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    icon: "text-gray-500 bg-gray-500/10 border-gray-500/20",
  },
  blue: {
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    icon: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
};

// =============================================
// Mappings Logic
// =============================================

export const FORMAT_TO_COLOR: Record<DocumentFormat, string> = {
  external: 'sky',
  pdf: 'red',
  doc: 'indigo',
  docx: 'indigo',
  odt: 'indigo',
  ppt: 'orange',
  pptx: 'orange',
  odp: 'orange',
  xls: 'green',
  xlsx: 'green',
  csv: 'green',
  ods: 'green',
  tsv: 'green',
  jpg: 'yellow',
  png: 'yellow',
  jpeg: 'yellow',
  webp: 'yellow',
  gif: 'yellow',
  rtf: 'gray',
  txt: 'gray',
  md: 'gray',
  json: 'gray',
};

const STATUS_TO_COLOR: Record<EventStatus, string> = {
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'red',
  rescheduled: 'yellow',
  pending: 'gray',
};

// =============================================
// Helper Functions
// =============================================

function getStyles(colorName: string, type: 'badge' | 'icon'): string {
  // Fallback to gray if color not found
  const styles = COLOR_STYLES[colorName] || COLOR_STYLES['gray'];
  return styles[type];
}

/**
 * Returns the CSS classes for an event status badge.
 */
export function getStatusBadgeVariant(status?: EventStatus) {
  const currentStatus = status || 'pending';
  const colorName = STATUS_TO_COLOR[currentStatus];
  return getStyles(colorName, 'badge');
}

/**
 * Returns the CSS classes for a document format badge.
 */
export function getFormatBadgeVariant(format?: DocumentFormat) {
  const currentFormat = format || 'txt';
  const colorName = FORMAT_TO_COLOR[currentFormat];
  return getStyles(colorName, 'badge');
}

/**
 * Returns the CSS classes for a document format icon container.
 */
export function getIconColorClass(format?: DocumentFormat) {
  const currentFormat = format || 'txt';
  const colorName = FORMAT_TO_COLOR[currentFormat];
  return getStyles(colorName, 'icon');
}
