import { countRecords } from "../db/repositories/health";
import { internalError } from "../lib/errors";

export async function getDatabaseStatus() {
	const counts = await countRecords();

	if (!counts) {
		throw internalError("errors.databaseUnavailable");
	}

	return {
		tickets: counts.TICKETS,
		clienti: counts.CLIENTI,
		persone: counts.PERSONE,
	};
}
