import { activityInputSchema } from "#shared/schemas/activity";
import { defineApiHandler, readValidatedBody, readValidatedParam } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";
import { update } from "../../services/activities.service";

export default defineApiHandler(async (event) => {
	const user = await requireUser(event);
	const id = readValidatedParam(event, "id");
	const input = await readValidatedBody(event, activityInputSchema);

	return toJson(event, await update(id, input, user.code), "activity.updated");
});
