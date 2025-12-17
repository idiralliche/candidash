// Dictionaries for mapping technical enums to French labels
// Future-proof: This structure allows easy replacement with i18n libraries later

export const LABELS_APPLICATION: Record<string, string> = {
  job_posting: "Offre d'emploi",
  spontaneous: "Candidature Spontanée",
  reached_out: "Contacté par recruteur",
};

export const LABELS_CONTRACT: Record<string, string> = {
  permanent: "CDI",
  fixed_term: "CDD",
  freelance: "Freelance",
  contractor: "Portage / Externe",
  internship: "Stage",
  apprenticeship: "Alternance",
};

export const LABELS_REMOTE: Record<string, string> = {
  on_site: "Sur site (100%)",
  full_remote: "Full Remote",
  hybrid: "Hybride",
  flexible: "Flexible",
};

export const LABELS_EVENT_STATUS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  rescheduled: "Reporté",
  cancelled: "Annulé",
  completed: "Terminé",
};

export const LABELS_COMMUNICATION_METHOD: Record<string, string> = {
  video: "Visio",
  phone: "Téléphone",
  in_person: "En personne",
  email: "Email",
  other: "Autre",
};

export const LABELS_DOCUMENT_FORMAT: Record<string, string> = {
  // Documents
  pdf: 'PDF',
  doc: 'Word (DOC)',
  docx: 'Word (DOCX)',
  rtf: 'RTF',
  txt: 'Texte',
  md: 'Markdown',

  // Presentations
  ppt: 'PowerPoint (PPT)',
  pptx: 'PowerPoint (PPTX)',
  odp: 'OpenDocument Pres.',

  // Spreadsheets
  xls: 'Excel (XLS)',
  xlsx: 'Excel (XLSX)',
  ods: 'OpenDocument Sheet',
  csv: 'CSV',
  tsv: 'TSV',

  // LibreOffice
  odt: 'OpenDocument Text',

  // Images
  jpg: 'Image (JPG)',
  jpeg: 'Image (JPEG)',
  png: 'Image (PNG)',
  gif: 'Image (GIF)',
  webp: 'Image (WEBP)',

  // Data
  json: 'JSON',

  // External
  external: 'Lien Externe',
};

/**
 * Helper to safely get a label from a dictionary.
 * Returns the key itself if not found.
 */
export function getLabel(dict: Record<string, string>, key?: string | null): string {
  if (!key) return '';
  return dict[key] || key;
}
