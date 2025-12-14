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

/**
 * Helper to safely get a label from a dictionary.
 * Returns the key itself if not found.
 */
export function getLabel(dict: Record<string, string>, key?: string | null): string {
  if (!key) return '';
  return dict[key] || key;
}
