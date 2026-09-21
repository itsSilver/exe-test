import { defineApiHandler } from "../lib/handler";
import { toJson } from "../lib/response";
import { getDatabaseStatus } from "../services/health.service";

export default defineApiHandler(async (event) => {
	const status = await getDatabaseStatus();

	return toJson(event, status, "health.connected");
});
