import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";

export default defineEventHandler(async (event) => {
	const user = await requireUser(event);

	return toJson(event, user);
});
