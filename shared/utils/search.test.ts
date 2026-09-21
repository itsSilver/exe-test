import { describe, expect, it } from "vitest";
import { isSearchable, toLikePattern } from "./search";

describe("isSearchable", () => {
	it.each(["", "a", "ab", "  a  ", undefined])("ignores %p", (term) => {
		expect(isSearchable(term)).toBe(false);
	});

	it.each(["abc", "rossi", " abc "])("accepts %p", (term) => {
		expect(isSearchable(term)).toBe(true);
	});
});

describe("toLikePattern", () => {
	it("wraps the term in wildcards and upper cases it", () => {
		expect(toLikePattern("rossi")).toBe("%ROSSI%");
	});

	it("trims the term", () => {
		expect(toLikePattern("  verdi  ")).toBe("%VERDI%");
	});

	// senza escape una ricerca di "%" scansionerebbe tutta la tabella
	it("escapes the wildcards a user can type", () => {
		expect(toLikePattern("%")).toBe("%\\%%");
		expect(toLikePattern("_")).toBe("%\\_%");
		expect(toLikePattern("50\\50")).toBe("%50\\\\50%");
	});

	it("keeps accented characters as they are", () => {
		expect(toLikePattern("attività")).toBe("%ATTIVITÀ%");
	});
});
