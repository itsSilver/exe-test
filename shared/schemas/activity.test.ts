import { describe, expect, it } from "vitest";
import it_ from "../../i18n/locales/it.json";
import { activityInputSchema, activityQuerySchema } from "./activity";

const valid = {
	customerCode: "000002",
	personCode: "ARPA01",
	date: "2026-09-21",
	hours: 0.25,
	workTypeCode: "MA",
	status: "A",
	priority: "M",
	referencePerson: "Mario Rossi",
	note: "Verifica caldaia",
};

function firstIssue(input: unknown) {
	const result = activityInputSchema.safeParse(input);

	if (result.success) {
		throw new Error("expected the input to be rejected");
	}

	return result.error.issues[0]?.message;
}

describe("activityInputSchema", () => {
	it("accepts a complete activity", () => {
		expect(activityInputSchema.safeParse(valid).success).toBe(true);
	});

	it.each([
		["a missing customer", { customerCode: "" }, "activity.validation.customerRequired"],
		["a missing person", { personCode: "" }, "activity.validation.personRequired"],
		["zero hours", { hours: 0 }, "activity.validation.hoursPositive"],
		["negative hours", { hours: -1 }, "activity.validation.hoursPositive"],
		["an empty note", { note: "   " }, "activity.validation.noteRequired"],
	])("rejects %s", (_case, overrides, expected) => {
		expect(firstIssue({ ...valid, ...overrides })).toBe(expected);
	});

	// il messaggio è una chiave: se manca dal dizionario l'utente vedrebbe la chiave
	it("only uses keys that exist in the translations", () => {
		const messages = it_.activity.validation as Record<string, string>;

		for (const field of ["customerRequired", "personRequired", "dateRequired", "hoursPositive", "statusRequired", "priorityRequired", "noteRequired"]) {
			expect(messages[field]).toBeTruthy();
		}
	});

	it("trims the text fields", () => {
		const parsed = activityInputSchema.parse({ ...valid, note: "  nota  ", referencePerson: " x " });

		expect(parsed.note).toBe("nota");
		expect(parsed.referencePerson).toBe("x");
	});
});

describe("activityQuerySchema", () => {
	it("defaults to the first page, newest first", () => {
		expect(activityQuerySchema.parse({})).toMatchObject({
			page: 1,
			limit: 20,
			sort: "date",
			order: "desc",
		});
	});

	it("coerces the numbers that arrive as strings in a query", () => {
		expect(activityQuerySchema.parse({ page: "3", limit: "5" })).toMatchObject({ page: 3, limit: 5 });
	});

	it("caps the page size so a client cannot ask for everything", () => {
		expect(activityQuerySchema.safeParse({ limit: 5000 }).success).toBe(false);
	});

	it.each([0, -1])("rejects page %i", (page) => {
		expect(activityQuerySchema.safeParse({ page }).success).toBe(false);
	});
});
