import { defineApiHandler } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { clearUserSession } from "../../lib/session";

export default defineApiHandler(async (event) => {
	await clearUserSession(event);

	return toJson(event, null, "auth.logoutSuccess");
});
