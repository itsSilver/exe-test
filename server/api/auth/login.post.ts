import { loginSchema } from "#shared/schemas/auth";
import {
	findUserByCode,
	recordAccess,
	toUser,
	verifyPassword,
} from "../../db/repositories/users";
import { t, throwLocalizedError } from "../../lib/i18n";
import { toJson } from "../../lib/response";
import { setUserSession } from "../../lib/session";

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, loginSchema.safeParse);

	if (!body.success) {
		const issue = body.error.issues[0];

		throw createError({
			statusCode: 400,
			statusMessage: t(event, issue?.message ?? "errors.invalidCredentials"),
		});
	}

	const { userCode, password, turnstileToken } = body.data;

	const captcha = await verifyTurnstileToken(turnstileToken, event);

	if (!captcha.success) {
		throwLocalizedError(event, 400, "errors.captchaFailed");
	}

	const row = await findUserByCode(userCode);

	// stesso messaggio per codice inesistente e password errata, così non si
	// può usare il form per scoprire quali utenti esistono
	if (!row || !verifyPassword(row, password)) {
		throwLocalizedError(event, 401, "errors.invalidCredentials");
	}

	const user = toUser(row);

	await setUserSession(event, user);
	await recordAccess(user.code);

	return toJson(event, user, "auth.loginSuccess");
});
