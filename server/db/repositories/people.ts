import type { LookupItem, LookupQuery } from "#shared/schemas/lookup";
import { toLikePattern } from "#shared/utils/search";
import { type Database, withDb } from "../client";

interface PersonRow {
	CCODPERS: string | null;
	CDESPERS: string | null;
}

export function toPerson(row: PersonRow): LookupItem {
	return {
		code: row.CCODPERS?.trim() ?? "",
		name: row.CDESPERS?.trim() ?? "",
	};
}

// il codice e la descrizione sono già maiuscoli in TBPERS
function wherePeople(db: Database, search: string) {
	const base = db.sql`WHERE CCODPERS IS NOT NULL AND TRIM(CCODPERS) <> ''`;

	if (!search) {
		return base;
	}

	const pattern = toLikePattern(search);
	const like = () => db.sql`CAST(${pattern} AS VARCHAR(256)) ESCAPE '\\'`;

	return db.sql`${base} AND (UPPER(CDESPERS) LIKE ${like()} OR CCODPERS LIKE ${like()})`;
}

/** TBPERS in alphabetical order, one page at a time. */
export function findPeople({ search, page, limit }: LookupQuery) {
	const offset = (page - 1) * limit;

	return withDb(async (db) => {
		const rows = await db.sql<PersonRow>`
			SELECT CCODPERS, CDESPERS FROM TBPERS
			${wherePeople(db, search)}
			ORDER BY CDESPERS
			ROWS ${offset + 1} TO ${offset + limit}
		`;

		return rows.map(toPerson);
	});
}

export function countPeople({ search }: Pick<LookupQuery, "search">) {
	return withDb(async (db) => {
		const rows = await db.sql<{ TOTAL: number }>`
			SELECT COUNT(*) AS TOTAL FROM TBPERS ${wherePeople(db, search)}
		`;

		return rows[0]?.TOTAL ?? 0;
	});
}
