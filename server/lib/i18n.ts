import type { H3Event } from "h3";
import en from "../../i18n/locales/en.json";
import it from "../../i18n/locales/it.json";

const messages = { it, en };

export type Locale = keyof typeof messages;

const DEFAULT_LOCALE: Locale = "it";
const COOKIE_KEY = "edison_locale";

function isSupported(value: string): value is Locale {
	return value in messages;
}

/**
 * Picks the locale for a request: the cookie set by the language switcher wins,
 * otherwise the best match from Accept-Language, otherwise Italian.
 */
export function resolveLocale(event: H3Event): Locale {
	const cookie = getCookie(event, COOKIE_KEY);

	if (cookie && isSupported(cookie)) {
		return cookie;
	}

	const header = getRequestHeader(event, "accept-language") ?? "";

	const preferred = header
		.split(",")
		.map((part) => {
			const [tag = "", q = "q=1"] = part.trim().split(";");
			return { tag: tag.split("-")[0]?.toLowerCase() ?? "", quality: Number(q.replace("q=", "")) || 0 };
		})
		.sort((a, b) => b.quality - a.quality)
		.find(entry => isSupported(entry.tag));

	return preferred ? (preferred.tag as Locale) : DEFAULT_LOCALE;
}

function lookup(locale: Locale, key: string): string | undefined {
	const value = key
		.split(".")
		.reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], messages[locale]);

	return typeof value === "string" ? value : undefined;
}

/** Translates `key` for the request's locale, falling back to Italian. */
export function t(event: H3Event, key: string, params: Record<string, string | number> = {}): string {
	const locale = resolveLocale(event);
	const message = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;

	return message.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

/** Throws an H3 error whose message is translated for the request's locale. */
export function throwLocalizedError(event: H3Event, statusCode: number, key: string): never {
	throw createError({ statusCode, statusMessage: t(event, key) });
}
