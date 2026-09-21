import type { User } from "#shared/schemas/auth";
import { withDb } from "../client";

interface UserRow {
	CCODUTEN: string | null;
	CDESUTEN: string | null;
	PASSWORD: string | null;
	CCODRUOL: string | null;
}

export function toUser(row: UserRow): User {
	return {
		code: row.CCODUTEN?.trim() ?? "",
		name: row.CDESUTEN?.trim() ?? "",
		role: row.CCODRUOL?.trim() ?? "",
	};
}

export function findUserByCode(code: string) {
	return withDb(async (db) => {
		const rows = await db.sql<UserRow>`
			SELECT CCODUTEN, CDESUTEN, PASSWORD, CCODRUOL
			FROM TBUTEN
			WHERE UPPER(TRIM(CCODUTEN)) = UPPER(TRIM(${code}))
		`;

		return rows[0];
	});
}

// le password in TBUTEN sono in chiaro, come da specifica
export function verifyPassword(row: UserRow, password: string): boolean {
	const stored = row.PASSWORD?.trim() ?? "";

	return stored.length > 0 && stored === password.trim();
}

/** Edison PLUS stamps the last access on every login, so we do the same. */
export function recordAccess(code: string) {
	return withDb(async (db) => {
		await db.sql`
			UPDATE TBUTEN
			SET DDATACC = CURRENT_TIMESTAMP
			WHERE UPPER(TRIM(CCODUTEN)) = UPPER(TRIM(${code}))
		`;
	});
}

export type { UserRow };
