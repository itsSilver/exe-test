/** Below this the search is ignored: one or two letters match almost everything. */
export const MIN_SEARCH_LENGTH = 3;

export function isSearchable(term: string | undefined): term is string {
	return (term?.trim().length ?? 0) >= MIN_SEARCH_LENGTH;
}

/**
 * Builds the LIKE pattern. The wildcards a user can type are escaped, so a
 * term of "%" searches for a percent sign instead of scanning the whole table,
 * and the term is upper cased once here rather than per row in SQL.
 */
export function toLikePattern(term: string): string {
	const escaped = term
		.trim()
		.toUpperCase()
		.replace(/[\\%_]/g, character => `\\${character}`);

	return `%${escaped}%`;
}
