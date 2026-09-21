import { describe, expect, it } from "vitest";
import { hoursToMinutes, minutesToHours, round } from "./hours";

describe("minutesToHours", () => {
	it("converts the example given in the specification", () => {
		expect(minutesToHours(15)).toBe(0.25);
	});

	it.each([
		[30, 0.5],
		[45, 0.75],
		[60, 1],
		[90, 1.5],
		[120, 2],
	])("converts %i minutes to %f hours", (minutes, expected) => {
		expect(minutesToHours(minutes)).toBe(expected);
	});

	it("keeps thirds of an hour within the precision NORE allows", () => {
		expect(minutesToHours(20)).toBe(0.33333);
	});

	it("returns zero for zero, so the caller can reject it", () => {
		expect(minutesToHours(0)).toBe(0);
	});
});

describe("hoursToMinutes", () => {
	it("goes back the other way for the edit form", () => {
		expect(hoursToMinutes(0.25)).toBe(15);
		expect(hoursToMinutes(1.5)).toBe(90);
	});

	it("survives a round trip", () => {
		expect(hoursToMinutes(minutesToHours(45))).toBe(45);
	});
});

describe("round", () => {
	it("keeps the five decimals NORE stores", () => {
		expect(round(0.333333333)).toBe(0.33333);
	});

	it("leaves a value that already fits alone", () => {
		expect(round(0.25)).toBe(0.25);
	});
});
