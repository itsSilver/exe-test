import { describe, expect, it } from "vitest";
import { type ActivityRow, toActivity } from "./activities";

function row(overrides: Partial<ActivityRow> = {}): ActivityRow {
	return {
		IDREC: 19,
		CCODCLIE: "000001",
		CDESCLIE: "ABC S.P.A.",
		DDATATTI: new Date(2026, 0, 16),
		CCODPERS: "ASTI01",
		CDESPERS: "ASSISTENZA TICKET",
		NORE: 0.25,
		CCODCAUS: "TK",
		CDESGENE: "TICKET",
		CSTATO: "A",
		CPRIORIT: "B",
		CPERRIFE: "",
		MMEMO: null,
		MMEMOPLAIN: "PER FAVORE RICHIAMATEMI",
		DDATOPER: new Date(2026, 0, 16),
		CORAOPER: "15:02",
		...overrides,
	};
}

describe("toActivity", () => {
	it("maps the legacy columns onto the domain shape", () => {
		expect(toActivity(row())).toEqual({
			id: 19,
			customerCode: "000001",
			customerName: "ABC S.P.A.",
			personCode: "ASTI01",
			personName: "ASSISTENZA TICKET",
			date: "2026-01-16",
			hours: 0.25,
			workTypeCode: "TK",
			workTypeName: "TICKET",
			status: "A",
			priority: "B",
			referencePerson: "",
			note: "PER FAVORE RICHIAMATEMI",
			revision: "2026-01-16 15:02",
		});
	});

	it("keeps the day the driver returned, without drifting through UTC", () => {
		expect(toActivity(row({ DDATATTI: new Date(2026, 0, 13) })).date).toBe("2026-01-13");
	});

	it("prefers the plain mirror over the RTF column", () => {
		const activity = toActivity(row({
			MMEMO: "{\\rtf1\\ansi\\deff0 qualcosa\\par }",
			MMEMOPLAIN: "QUALCOSA",
		}));

		expect(activity.note).toBe("QUALCOSA");
	});

	it("falls back to the RTF column when the mirror is empty", () => {
		const activity = toActivity(row({
			MMEMO: "{\\rtf1\\ansi\\deff0 visita medica\\par }",
			MMEMOPLAIN: "",
		}));

		expect(activity.note).toBe("visita medica");
	});

	it("reads a plain memo, since TBATCL holds both shapes", () => {
		const activity = toActivity(row({
			MMEMO: "Inventario in magazzino\r\n",
			MMEMOPLAIN: null,
		}));

		expect(activity.note).toBe("Inventario in magazzino");
	});

	it("trims the codes and survives the nulls the table allows", () => {
		const activity = toActivity(row({
			CCODCLIE: " 000001 ",
			CDESCLIE: null,
			CCODPERS: null,
			CDESPERS: null,
			NORE: null,
		}));

		expect(activity.customerCode).toBe("000001");
		expect(activity.customerName).toBe("");
		expect(activity.personCode).toBe("");
		expect(activity.hours).toBe(0);
	});

	it.each([["A", "A"], ["S", "S"], ["C", "C"], ["", "A"], [null, "A"], ["x", "A"]])(
		"normalises the status %s to %s",
		(stored, expected) => {
			expect(toActivity(row({ CSTATO: stored })).status).toBe(expected);
		},
	);

	it.each([["A", "A"], ["M", "M"], ["B", "B"], ["", "B"], [null, "B"]])(
		"normalises the priority %s to %s",
		(stored, expected) => {
			expect(toActivity(row({ CPRIORIT: stored })).priority).toBe(expected);
		},
	);
});

describe("revision", () => {
	it("is built from the audit columns Edison PLUS maintains", () => {
		expect(toActivity(row()).revision).toBe("2026-01-16 15:02");
	});

	it("changes when the row is saved again", () => {
		const before = toActivity(row()).revision;
		const after = toActivity(row({ CORAOPER: "16:40" })).revision;

		expect(after).not.toBe(before);
	});

	it("is empty for a row that was never stamped", () => {
		expect(toActivity(row({ DDATOPER: null, CORAOPER: null })).revision).toBe("");
	});
});
