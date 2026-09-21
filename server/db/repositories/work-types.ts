import { withDb } from "../client";

interface WorkTypeRow {
	CCODGENE: string | null;
	CDESGENE: string | null;
}

export interface WorkType {
	code: string;
	name: string;
}

/** TBGENE is a generic lookup: work types are the rows with CTPGENE = '03'. */
export function findAllWorkTypes() {
	return withDb(async (db) => {
		const rows = await db.sql<WorkTypeRow>`
			SELECT CCODGENE, CDESGENE
			FROM TBGENE
			WHERE CTPGENE = '03'
			ORDER BY CDESGENE
		`;

		return rows.map(row => ({
			code: row.CCODGENE?.trim() ?? "",
			name: row.CDESGENE?.trim() ?? "",
		}));
	});
}
