import { describe, expect, it } from "vitest";
import { toUser, type UserRow } from "./users";

function row(overrides: Partial<UserRow> = {}): UserRow {
	return {
		CCODUTEN: "01",
		CDESUTEN: "UTENTE 01",
		PASSWORD: "123",
		CCODRUOL: "",
		...overrides,
	};
}

describe("toUser", () => {
	it("maps the legacy columns onto the domain shape", () => {
		expect(toUser(row())).toEqual({ code: "01", name: "UTENTE 01", role: "" });
	});

	it("never exposes the password", () => {
		expect(Object.keys(toUser(row()))).toEqual(["code", "name", "role"]);
	});

	it("trims the padding the legacy columns carry", () => {
		const user = toUser(row({ CCODUTEN: " 01 ", CDESUTEN: "  UTENTE 01  " }));

		expect(user.code).toBe("01");
		expect(user.name).toBe("UTENTE 01");
	});

	it("turns nulls into empty strings", () => {
		const user = toUser(row({ CDESUTEN: null, CCODRUOL: null }));

		expect(user.name).toBe("");
		expect(user.role).toBe("");
	});
});
