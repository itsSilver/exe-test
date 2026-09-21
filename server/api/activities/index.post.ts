import { activityInputSchema } from "#shared/schemas/activity";
import { defineApiHandler, readValidatedBody } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";
import { create } from "../../services/activities.service";

export default defineApiHandler(async (event) => {
	const user = await requireUser(event);
	const input = await readValidatedBody(event, activityInputSchema);

	return toJson(event, await create(input, user.code), "activity.created");
});
