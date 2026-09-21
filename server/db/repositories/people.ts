import { withDb } from "../client";

interface PersonRow {
	CCODPERS: string | null;
	CDESPERS: string | null;
}

export interface Person {
	code: string;
	name: string;
}

export function toPerson(row: PersonRow): Person {
	return {
		code: row.CCODPERS?.trim() ?? "",
		name: row.CDESPERS?.trim() ?? "",
	};
}

/** TBPERS in alphabetical order, as the specification asks for the pickers. */
export function findAllPeople() {
	return withDb(async (db) => {
		const rows = await db.sql<PersonRow>`
			SELECT CCODPERS, CDESPERS
			FROM TBPERS
			WHERE CCODPERS IS NOT NULL AND TRIM(CCODPERS) <> ''
			ORDER BY CDESPERS
		`;

		return rows.map(toPerson);
	});
}
