import { loginSchema } from "#shared/schemas/auth";
import { defineApiHandler, readValidatedBody } from "../../lib/handler";
import { toJson } from "../../lib/response";
import { setUserSession } from "../../lib/session";
import { assertCaptcha, authenticate } from "../../services/auth.service";

export default defineApiHandler(async (event) => {
	const { userCode, password, turnstileToken } = await readValidatedBody(event, loginSchema);

	await assertCaptcha(turnstileToken, token => verifyTurnstileToken(token, event));

	const user = await authenticate(userCode, password);
	await setUserSession(event, user);

	return toJson(event, user, "auth.loginSuccess");
});
