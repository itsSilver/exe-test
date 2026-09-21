import { toJson } from "../../lib/response";
import { clearUserSession } from "../../lib/session";

export default defineEventHandler(async (event) => {
	await clearUserSession(event);

	return toJson(event, null, "auth.logoutSuccess");
});
