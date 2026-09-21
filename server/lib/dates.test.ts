import { describe, expect, it } from "vitest";
import { fromIsoDate, toIsoDate } from "./dates";

describe("toIsoDate", () => {
	it("keeps the day the driver actually returned", () => {
		// il driver restituisce la mezzanotte locale: passando da UTC
		// questa data diventerebbe il 12 gennaio
		expect(toIsoDate(new Date(2026, 0, 13))).toBe("2026-01-13");
	});

	it("pads month and day", () => {
		expect(toIsoDate(new Date(2026, 8, 5))).toBe("2026-09-05");
	});

	it("handles the first day of the year", () => {
		expect(toIsoDate(new Date(2026, 0, 1))).toBe("2026-01-01");
	});

	it("returns an empty string for a missing date", () => {
		expect(toIsoDate(null)).toBe("");
		expect(toIsoDate(undefined)).toBe("");
	});
});

describe("fromIsoDate", () => {
	it("builds the local midnight the table stores", () => {
		const date = fromIsoDate("2026-01-13");

		expect(date.getFullYear()).toBe(2026);
		expect(date.getMonth()).toBe(0);
		expect(date.getDate()).toBe(13);
		expect(date.getHours()).toBe(0);
	});

	it("survives a round trip", () => {
		expect(toIsoDate(fromIsoDate("2026-01-13"))).toBe("2026-01-13");
	});

	it("rejects an unusable value", () => {
		expect(() => fromIsoDate("")).toThrow();
		expect(() => fromIsoDate("not-a-date")).toThrow();
	});
});
