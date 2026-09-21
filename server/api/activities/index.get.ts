import { activityQuerySchema } from "#shared/schemas/activity";
import { defineApiHandler, readValidatedQuery } from "../../lib/handler";
import { toJsonPaginated } from "../../lib/response";
import { requireUser } from "../../lib/session";
import { listActivities } from "../../services/activities.service";

export default defineApiHandler(async (event) => {
	await requireUser(event);

	const query = readValidatedQuery(event, activityQuerySchema);
	const { activities, total } = await listActivities(query);

	return toJsonPaginated(event, activities, { ...query, total });
});
