import {
  EventStatus,
  DocumentFormat,
  ApplicationType,
  ApplicationStatus,
} from '@/api/model';

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
  | "indigo"
  | "emerald";

// --- MAPPINGS ---

export const EVENT_STATUS_COLOR: Record<EventStatus, UiPalette> = {
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'red',
  rescheduled: 'orange',
  pending: 'gray',
};

export const APPLICATION_TYPE_COLOR: Record<ApplicationType, UiPalette> = {
  job_posting: 'emerald',
  spontaneous: 'indigo',
  reached_out: 'orange',
};

export const DOCUMENT_FORMAT_COLOR: Record<DocumentFormat, UiPalette> = {
  pdf: 'red',
  doc: 'blue',
  docx: 'blue',
  xls: 'green',
  xlsx: 'green',
  ppt: 'orange',
  pptx: 'orange',
  odt: 'indigo',
  ods: 'green',
  odp: 'orange',
  csv: 'green',
  tsv: 'green',
  json: 'gray',
  jpg: 'yellow',
  jpeg: 'yellow',
  png: 'yellow',
  gif: 'yellow',
  webp: 'yellow',
  txt: 'gray',
  rtf: 'gray',
  md: 'gray',
  external: 'sky',
};

export const APPLICATION_STATUS_COLOR: Record<ApplicationStatus, UiPalette> = {
  pending: 'blue',
  follow_up_scheduled: 'orange',
  interview_scheduled: 'purple',
  rejected: 'red',
  accepted: 'green',
  obsolete: 'gray',
};

// --- GENERIC HELPER ---

/**
 * Generic helper to retrieve palette color from a map with fallback.
 */
function getPalette<T extends string>(
  value: T | undefined | null,
  map: Record<T, UiPalette>,
  fallback: UiPalette = 'gray'
): UiPalette {
  if (!value) return fallback;
  return map[value] || fallback;
}

// --- PUBLIC API ---

export const getEventStatusPalette = (s?: EventStatus) => getPalette(s, EVENT_STATUS_COLOR, 'gray');
export const getFormatPalette = (f?: DocumentFormat) => getPalette(f, DOCUMENT_FORMAT_COLOR, 'gray');
export const getApplicationTypePalette = (t?: ApplicationType) => getPalette(t, APPLICATION_TYPE_COLOR, 'gray');
export const getApplicationStatusPalette = (s?: ApplicationStatus) => getPalette(s, APPLICATION_STATUS_COLOR, 'blue');


export const genderMap: Record<string, { article: string; suffix: string; demonstrative: string }> = {
  opportunité: { article: "L'", suffix: "e", demonstrative: "cette" },
  candidature: { article: "La ", suffix: "e", demonstrative: "cette" },
  entreprise: { article: "L'", suffix: "e", demonstrative: "cette" },
  contact: { article: "Le ", suffix: "", demonstrative: "ce" },
  document: { article: "Le ", suffix: "", demonstrative: "ce" },
  produit: { article: "Le ", suffix: "", demonstrative: "ce" },
  événement: { article: "L'", suffix: "", demonstrative: "cet" },
  action: { article: "L'", suffix: "", demonstrative: "cet" },
};
