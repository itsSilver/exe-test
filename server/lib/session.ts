import type { H3Event } from "h3";
import type { User } from "#shared/schemas/auth";
import { throwLocalizedError } from "./i18n";

interface SessionData {
	user: User;
}

const SESSION_NAME = "edison_session";

function sessionConfig() {
	const { sessionSecret } = useRuntimeConfig();

	return {
		name: SESSION_NAME,
		password: sessionSecret,
		cookie: {
			httpOnly: true,
			sameSite: "lax" as const,
			secure: !import.meta.dev,
			path: "/",
		},
	};
}

export function getUserSession(event: H3Event) {
	return useSession<SessionData>(event, sessionConfig());
}

export async function setUserSession(event: H3Event, user: User) {
	const session = await getUserSession(event);
	await session.update({ user });
}

export async function clearUserSession(event: H3Event) {
	const session = await getUserSession(event);
	await session.clear();
}

export async function getUser(event: H3Event): Promise<User | undefined> {
	const session = await getUserSession(event);

	return session.data.user;
}

/** Guards an endpoint: returns the logged-in user or throws a localized 401. */
export async function requireUser(event: H3Event): Promise<User> {
	const user = await getUser(event);

	if (!user) {
		throwLocalizedError(event, 401, "errors.unauthorized");
	}

	return user;
}
