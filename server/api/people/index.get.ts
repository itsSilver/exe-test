import { findAllPeople } from "../../db/repositories/people";
import { defineApiHandler } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";

export default defineApiHandler(async (event) => {
	await requireUser(event);

	return toJson(event, await findAllPeople());
});
