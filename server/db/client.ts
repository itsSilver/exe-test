import Firebird from "node-firebird";
import type { Database } from "node-firebird";

let pool: Firebird.ConnectionPool | undefined;

function createPool() {
	const { firebird } = useRuntimeConfig();

	return Firebird.pool(5, {
		host: firebird.host,
		port: Number(firebird.port),
		database: firebird.database,
		user: firebird.user,
		password: firebird.password,
		// The database was created with ISO8859_1; without this the accented
		// characters in customer names and addresses come back corrupted.
		encoding: "ISO8859_1",
		// MMEMO and MMEMOPLAIN are blobs and are always read as text.
		blobAsText: true,
		// NORE is NUMERIC(18,5), not a float. "safe" keeps it a number while
		// the value fits, instead of silently losing precision.
		numericMode: "safe",
	});
}

function getPool() {
	if (!pool) {
		pool = createPool();
	}

	return pool;
}

/** Acquire a pooled connection, run `work`, always give the connection back. */
export function withDb<T>(work: (db: Database) => Promise<T> | T): Promise<T> {
	return getPool().withConnection(work);
}

export async function closePool() {
	await pool?.destroyAsync();
	pool = undefined;
}

export type { Database };
