/** Below this the search is ignored: one or two letters match almost everything. */
export const MIN_SEARCH_LENGTH = 3;

/** The customer picker asks for four, as the specification states. */
export const MIN_CUSTOMER_SEARCH_LENGTH = 4;

export function isSearchable(
	term: string | undefined,
	minLength = MIN_SEARCH_LENGTH,
): term is string {
	return (term?.trim().length ?? 0) >= minLength;
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
