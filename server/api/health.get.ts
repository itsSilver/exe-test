import { withDb } from "../db/client";
import { throwLocalizedError } from "../lib/i18n";
import { toJson } from "../lib/response";

interface CountsRow {
	TICKETS: number;
	CLIENTI: number;
	PERSONE: number;
}

export default defineEventHandler(async (event) => {
	const rows = await withDb(async db => await db.sql<CountsRow>`
		SELECT
			(SELECT COUNT(*) FROM TBATCL) AS TICKETS,
			(SELECT COUNT(*) FROM TBCLIE) AS CLIENTI,
			(SELECT COUNT(*) FROM TBPERS) AS PERSONE
		FROM RDB$DATABASE
	`);

	const counts = rows[0];

	if (!counts) {
		throwLocalizedError(event, 503, "errors.databaseUnavailable");
	}

	return toJson(event, {
		tickets: counts.TICKETS,
		clienti: counts.CLIENTI,
		persone: counts.PERSONE,
	}, "health.connected");
});
