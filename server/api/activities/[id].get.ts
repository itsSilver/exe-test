import { defineApiHandler, readValidatedParam } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";
import { getById } from "../../services/activities.service";

export default defineApiHandler(async (event) => {
	await requireUser(event);

	return toJson(event, await getById(readValidatedParam(event, "id")));
});
