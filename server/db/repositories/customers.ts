import { isSearchable, MIN_CUSTOMER_SEARCH_LENGTH, toLikePattern } from "#shared/utils/search";
import { withDb } from "../client";

interface CustomerRow {
	CCODCLIE: string | null;
	CDESCLIE: string | null;
	CINDIR: string | null;
	CCOMUNE: string | null;
	CSTATO: string | null;
}

export interface Customer {
	code: string;
	name: string;
	address: string;
	city: string;
	status: string;
}

export function toCustomer(row: CustomerRow): Customer {
	return {
		code: row.CCODCLIE?.trim() ?? "",
		name: row.CDESCLIE?.trim() ?? "",
		address: row.CINDIR?.trim() ?? "",
		city: row.CCOMUNE?.trim() ?? "",
		status: row.CSTATO?.trim() ?? "",
	};
}

/**
 * The customer picker searches name, address and town, as the specification
 * asks. The pattern is cast so Firebird does not size the parameter from the
 * narrowest column it is compared against.
 */
export function searchCustomers(term: string, limit = 25) {
	if (!isSearchable(term, MIN_CUSTOMER_SEARCH_LENGTH)) {
		return Promise.resolve([]);
	}

	const pattern = toLikePattern(term);

	return withDb(async (db) => {
		const like = () => db.sql`CAST(${pattern} AS VARCHAR(256)) ESCAPE '\\'`;

		const rows = await db.sql<CustomerRow>`
			SELECT CCODCLIE, CDESCLIE, CINDIR, CCOMUNE, CSTATO
			FROM TBCLIE
			WHERE UPPER(CDESCLIE) LIKE ${like()}
				OR UPPER(CINDIR) LIKE ${like()}
				OR UPPER(CCOMUNE) LIKE ${like()}
				OR CCODCLIE LIKE ${like()}
			ORDER BY CDESCLIE
			ROWS ${limit}
		`;

		return rows.map(toCustomer);
	});
}

export function findCustomerByCode(code: string) {
	return withDb(async (db) => {
		const rows = await db.sql<CustomerRow>`
			SELECT CCODCLIE, CDESCLIE, CINDIR, CCOMUNE, CSTATO
			FROM TBCLIE
			WHERE TRIM(CCODCLIE) = ${code}
		`;

		return rows[0] ? toCustomer(rows[0]) : undefined;
	});
}
