import { describe, expect, it } from "vitest";
import { formatCodeLabel, formatDate, formatHours } from "./format";

describe("formatDate", () => {
	it("formats as GG/MM/AA", () => {
		expect(formatDate("2026-01-16")).toBe("16/01/26");
	});

	it("keeps the leading zeroes", () => {
		expect(formatDate("2019-06-05")).toBe("05/06/19");
	});

	it("returns an empty string when there is no date", () => {
		expect(formatDate("")).toBe("");
	});
});

describe("formatCodeLabel", () => {
	it("uses the format the specification gives as an example", () => {
		expect(formatCodeLabel("GIOVANARDI", "000003")).toBe("GIOVANARDI (000003)");
		expect(formatCodeLabel("ROSSI ANTONIO", "000002")).toBe("ROSSI ANTONIO (000002)");
	});

	it("falls back to the description when there is no code", () => {
		expect(formatCodeLabel("ROSSI ANTONIO", "")).toBe("ROSSI ANTONIO");
	});

	it("shows the code alone when the description is missing", () => {
		expect(formatCodeLabel("", "000002")).toBe("(000002)");
	});
});

describe("formatHours", () => {
	it("uses the decimal comma", () => {
		expect(formatHours(0.25)).toBe("0,25 h");
		expect(formatHours(2)).toBe("2,00 h");
	});
});
