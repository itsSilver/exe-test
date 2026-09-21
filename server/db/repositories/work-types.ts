import type { LookupItem, LookupQuery } from "#shared/schemas/lookup";
import { toLikePattern } from "#shared/utils/search";
import { type Database, withDb } from "../client";

interface WorkTypeRow {
	CCODGENE: string | null;
	CDESGENE: string | null;
}

/** TBGENE is a generic lookup: work types are the rows with CTPGENE = '03'. */
function whereWorkTypes(db: Database, search: string) {
	const base = db.sql`WHERE CTPGENE = '03'`;

	if (!search) {
		return base;
	}

	const pattern = toLikePattern(search);
	const like = () => db.sql`CAST(${pattern} AS VARCHAR(256)) ESCAPE '\\'`;

	return db.sql`${base} AND (UPPER(CDESGENE) LIKE ${like()} OR UPPER(CCODGENE) LIKE ${like()})`;
}

export function findWorkTypes({ search, page, limit }: LookupQuery) {
	const offset = (page - 1) * limit;

	return withDb(async (db) => {
		const rows = await db.sql<WorkTypeRow>`
			SELECT CCODGENE, CDESGENE FROM TBGENE
			${whereWorkTypes(db, search)}
			ORDER BY CDESGENE
			ROWS ${offset + 1} TO ${offset + limit}
		`;

		return rows.map((row): LookupItem => ({
			code: row.CCODGENE?.trim() ?? "",
			name: row.CDESGENE?.trim() ?? "",
		}));
	});
}

export function countWorkTypes({ search }: Pick<LookupQuery, "search">) {
	return withDb(async (db) => {
		const rows = await db.sql<{ TOTAL: number }>`
			SELECT COUNT(*) AS TOTAL FROM TBGENE ${whereWorkTypes(db, search)}
		`;

		return rows[0]?.TOTAL ?? 0;
	});
}
