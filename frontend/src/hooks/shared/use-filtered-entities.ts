import { useMemo } from 'react';
import { useDebounce } from '@/hooks/shared/use-debounce';

interface UseFilteredEntitiesOptions<T> {
  entities: T[] | undefined;
  searchTerm: string;
  searchFields: (entity: T) => string[];
  sortFn?: (a: T, b: T) => number;
  debounceDelay?: number;
}

/**
 * Generic hook to filter and sort entities based on search term
 * Results are sorted by relevance: items starting with search term appear first
 * Priority order: first field match > other fields > alphabetical
 */
export function useFilteredEntities<T>({
  entities,
  searchTerm,
  searchFields,
  sortFn,
  debounceDelay = 300,
}: UseFilteredEntitiesOptions<T>): T[] {
  const debouncedSearch = useDebounce(searchTerm, debounceDelay);

  return useMemo(() => {
    if (!entities) return [];
    if (!debouncedSearch.trim()) {
      return sortFn ? [...entities].sort(sortFn) : entities;
    }

    const lowerSearch = debouncedSearch.toLowerCase();

    // Filter entities that match search term
    const filtered = entities.filter(entity => {
      const fields = searchFields(entity);
      return fields.some(field =>
        field.toLowerCase().includes(lowerSearch)
      );
    });

    // Sort by relevance with field priority
    return filtered.sort((a, b) => {
      const fieldsA = searchFields(a);
      const fieldsB = searchFields(b);

      // Find the FIRST field that starts with search term for each entity
      const aFirstMatchIndex = fieldsA.findIndex(field =>
        field.toLowerCase().startsWith(lowerSearch)
      );
      const bFirstMatchIndex = fieldsB.findIndex(field =>
        field.toLowerCase().startsWith(lowerSearch)
      );

      // If A has a match and B doesn't
      if (aFirstMatchIndex !== -1 && bFirstMatchIndex === -1) return -1;
      // If B has a match and A doesn't
      if (aFirstMatchIndex === -1 && bFirstMatchIndex !== -1) return 1;

      // Both have matches: prioritize earlier field index (first_name before last_name)
      if (aFirstMatchIndex !== -1 && bFirstMatchIndex !== -1) {
        if (aFirstMatchIndex < bFirstMatchIndex) return -1;
        if (aFirstMatchIndex > bFirstMatchIndex) return 1;
        // Same field index: fall through to alphabetical
      }

      // No matches or same priority: use custom sort or alphabetical
      if (sortFn) return sortFn(a, b);

      return fieldsA[0].toLowerCase().localeCompare(fieldsB[0].toLowerCase());
    });
  }, [entities, debouncedSearch, searchFields, sortFn]);
}
