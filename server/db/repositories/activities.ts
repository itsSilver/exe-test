import type { Database } from "node-firebird";
import { type Activity, type ActivityQuery, UNASSIGNED } from "#shared/schemas/activity";
import { isSearchable, toLikePattern } from "#shared/utils/search";
import { toIsoDate } from "../../lib/dates";
import { fromRtf } from "../../lib/rtf";
import { withDb } from "../client";

type ActivityFilters = Pick<ActivityQuery, "status" | "priority" | "personCode" | "search">;

/**
 * Firebird types a bare parameter from the column it is compared against, so
 * matching a VARCHAR(6) code against "%000001%" fails with a string
 * truncation error. Casting the pattern gives it a length of its own.
 */
function like(db: Database, pattern: string) {
	return db.sql`CAST(${pattern} AS VARCHAR(256)) ESCAPE '\\'`;
}

export interface ActivityRow {
	IDREC: number;
	CCODCLIE: string | null;
	CDESCLIE: string | null;
	DDATATTI: Date | null;
	CCODPERS: string | null;
	CDESPERS: string | null;
	NORE: number | null;
	CCODCAUS: string | null;
	CDESGENE: string | null;
	CSTATO: string | null;
	CPRIORIT: string | null;
	CPERRIFE: string | null;
	MMEMO: string | null;
	MMEMOPLAIN: string | null;
}

/**
 * The columns and joins every read of TBATCL needs. Embedding a tagged query
 * inside another splices it in as a fragment instead of running it, so the
 * shape stays in one place without string concatenation.
 *
 * TBGENE è una tabella generica: le lavorazioni sono le righe con CTPGENE = '03'
 */
function selectActivities(db: Database) {
	return db.sql`
		SELECT
			a.IDREC, a.CCODCLIE, a.DDATATTI, a.CCODPERS, a.NORE, a.CCODCAUS,
			a.CSTATO, a.CPRIORIT, a.CPERRIFE, a.MMEMO, a.MMEMOPLAIN,
			c.CDESCLIE, p.CDESPERS, g.CDESGENE
		FROM TBATCL a
		LEFT JOIN TBCLIE c ON TRIM(c.CCODCLIE) = TRIM(a.CCODCLIE)
		LEFT JOIN TBPERS p ON TRIM(p.CCODPERS) = TRIM(a.CCODPERS)
		LEFT JOIN TBGENE g ON TRIM(g.CCODGENE) = TRIM(a.CCODCAUS) AND g.CTPGENE = '03'
	`;
}

export function toActivity(row: ActivityRow): Activity {
	return {
		id: row.IDREC,
		customerCode: row.CCODCLIE?.trim() ?? "",
		customerName: row.CDESCLIE?.trim() ?? "",
		personCode: row.CCODPERS?.trim() ?? "",
		personName: row.CDESPERS?.trim() ?? "",
		date: toIsoDate(row.DDATATTI),
		hours: row.NORE ?? 0,
		workTypeCode: row.CCODCAUS?.trim() ?? "",
		workTypeName: row.CDESGENE?.trim() ?? "",
		status: normalizeStatus(row.CSTATO),
		priority: normalizePriority(row.CPRIORIT),
		referencePerson: row.CPERRIFE?.trim() ?? "",
		// MMEMOPLAIN è lo specchio in chiaro di MMEMO, che invece è RTF
		note: row.MMEMOPLAIN?.trim() || fromRtf(row.MMEMO),
	};
}

function normalizeStatus(value: string | null): Activity["status"] {
	const status = value?.trim().toUpperCase();

	return status === "S" || status === "C" ? status : "A";
}

function normalizePriority(value: string | null): Activity["priority"] {
	const priority = value?.trim().toUpperCase();

	return priority === "A" || priority === "M" ? priority : "B";
}

/**
 * Builds the WHERE clause from the filters. An embedded query is spliced in as
 * a fragment, so the conditions stay parameterised.
 */
function whereFilters(db: Database, { status, priority, personCode, search }: ActivityFilters) {
	let clause = db.sql`WHERE 1 = 1`;

	if (status) {
		clause = db.sql`${clause} AND TRIM(a.CSTATO) = ${status}`;
	}

	if (priority) {
		clause = db.sql`${clause} AND TRIM(a.CPRIORIT) = ${priority}`;
	}

	if (isSearchable(search)) {
		const pattern = toLikePattern(search);

		/*
		 * Codes live on TBATCL itself, so they are matched directly. Customer
		 * and person names go through their own tables, which hold a handful
		 * of rows each, instead of putting UPPER() on the joined columns of
		 * every activity row: measured on this database that is roughly twice
		 * as fast. Codes and MMEMOPLAIN are compared without UPPER() because
		 * Edison PLUS already stores them upper case.
		 */
		clause = db.sql`${clause} AND (
			a.CCODCLIE LIKE ${like(db, pattern)}
			OR a.CCODPERS LIKE ${like(db, pattern)}
			OR a.CCODCLIE IN (
				SELECT CCODCLIE FROM TBCLIE WHERE UPPER(CDESCLIE) LIKE ${like(db, pattern)}
			)
			OR a.CCODPERS IN (
				SELECT CCODPERS FROM TBPERS WHERE UPPER(CDESPERS) LIKE ${like(db, pattern)}
			)
			OR a.MMEMOPLAIN LIKE ${like(db, pattern)}
		)`;
	}

	if (personCode === UNASSIGNED) {
		clause = db.sql`${clause} AND (a.CCODPERS IS NULL OR TRIM(a.CCODPERS) = '')`;
	}
	else if (personCode) {
		clause = db.sql`${clause} AND TRIM(a.CCODPERS) = ${personCode}`;
	}

	return clause;
}

/**
 * Sorting happens in the database because the page is a slice of the whole
 * table. Priority is stored as A/M/B, which sorts alphabetically as A, B, M,
 * so it is mapped to its real order first.
 */
function orderBy(db: Database, { sort, order }: Pick<ActivityQuery, "sort" | "order">) {
	const direction = order === "asc" ? db.sql`ASC` : db.sql`DESC`;

	const column = {
		date: db.sql`a.DDATATTI`,
		priority: db.sql`CASE TRIM(a.CPRIORIT) WHEN 'A' THEN 1 WHEN 'M' THEN 2 ELSE 3 END`,
		status: db.sql`CASE TRIM(a.CSTATO) WHEN 'A' THEN 1 WHEN 'S' THEN 2 ELSE 3 END`,
		customer: db.sql`c.CDESCLIE`,
		person: db.sql`p.CDESPERS`,
	}[sort];

	// NULLS LAST: parecchie righe puntano a clienti o persone non in anagrafica,
	// e senza questo finirebbero tutte in cima
	return db.sql`ORDER BY ${column} ${direction} NULLS LAST, a.IDREC DESC`;
}

export function findPaged(query: ActivityQuery) {
	const offset = (query.page - 1) * query.limit;

	return withDb(async (db) => {
		const filters = whereFilters(db, query);

		const rows = await db.sql<ActivityRow>`
			${selectActivities(db)}
			${filters}
			${orderBy(db, query)}
			ROWS ${offset + 1} TO ${offset + query.limit}
		`;

		return rows.map(toActivity);
	});
}

export function countFiltered(query: ActivityFilters) {
	return withDb(async (db) => {
		const rows = await db.sql<{ TOTAL: number }>`
			SELECT COUNT(*) AS TOTAL
			FROM TBATCL a
			${whereFilters(db, query)}
		`;

		return rows[0]?.TOTAL ?? 0;
	});
}

export function findById(id: number) {
	return withDb(async (db) => {
		const rows = await db.sql<ActivityRow>`
			${selectActivities(db)}
			WHERE a.IDREC = ${id}
		`;

		return rows[0] ? toActivity(rows[0]) : undefined;
	});
}
