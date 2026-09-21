import { findAllWorkTypes } from "../../db/repositories/work-types";
import { defineApiHandler } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { requireUser } from "../../lib/session";

export default defineApiHandler(async (event) => {
	await requireUser(event);

	return toJson(event, await findAllWorkTypes());
});
