import { z } from "zod";
import { searchCustomers } from "../../db/repositories/customers";
import { defineApiHandler, readValidatedQuery } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";

const querySchema = z.object({
	search: z.string().trim().max(60).default(""),
});

export default defineApiHandler(async (event) => {
	await requireUser(event);

	const { search } = readValidatedQuery(event, querySchema);

	return toJson(event, await searchCustomers(search));
});
