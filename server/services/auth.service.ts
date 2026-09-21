import type { User } from "#shared/schemas/auth";
import { findUserByCode, recordAccess, toUser, verifyPassword } from "../db/repositories/users";
import { badRequest, unauthorized } from "../lib/errors";

/**
 * Checks the credentials against TBUTEN and stamps the access, the way Edison
 * PLUS does. An unknown code and a wrong password fail identically, so the
 * login form cannot be used to find out which codes exist.
 */
export async function authenticate(userCode: string, password: string): Promise<User> {
	const row = await findUserByCode(userCode);

	if (!row || !verifyPassword(row, password)) {
		throw unauthorized("errors.invalidCredentials");
	}

	const user = toUser(row);
	await recordAccess(user.code);

	return user;
}

export async function assertCaptcha(
	token: string,
	verify: (token: string) => Promise<{ success: boolean }>,
) {
	const { success } = await verify(token);

	if (!success) {
		throw badRequest("errors.captchaFailed");
	}
}
