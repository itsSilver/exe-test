import { withDb } from "../client";

interface CountsRow {
	TICKETS: number;
	CLIENTI: number;
	PERSONE: number;
}

export function countRecords() {
	return withDb(async (db) => {
		const rows = await db.sql<CountsRow>`
			SELECT
				(SELECT COUNT(*) FROM TBATCL) AS TICKETS,
				(SELECT COUNT(*) FROM TBCLIE) AS CLIENTI,
				(SELECT COUNT(*) FROM TBPERS) AS PERSONE
			FROM RDB$DATABASE
		`;

		return rows[0];
	});
}
