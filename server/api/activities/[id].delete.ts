import { defineApiHandler, readValidatedParam } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";
import { remove } from "../../services/activities.service";

export default defineApiHandler(async (event) => {
	await requireUser(event);
	await remove(readValidatedParam(event, "id"));

	return toJson(event, null, "activity.deleted");
});
