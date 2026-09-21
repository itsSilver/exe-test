import { lookupQuerySchema } from "#shared/schemas/lookup";
import { countPeople, findPeople } from "../../db/repositories/people";
import { defineApiHandler, readValidatedQuery } from "../../lib/handler";
import { toJsonPaginated } from "../../lib/response";
import { requireUser } from "../../lib/session";

export default defineApiHandler(async (event) => {
	await requireUser(event);

	const query = readValidatedQuery(event, lookupQuerySchema);
	const [items, total] = await Promise.all([findPeople(query), countPeople(query)]);

	return toJsonPaginated(event, items, { ...query, total });
});
