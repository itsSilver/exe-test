import { getCookie, getRequestHeader, type H3Event } from "h3";
import en from "../../i18n/locales/en.json";
import it from "../../i18n/locales/it.json";

const messages = { it, en };

export type Locale = keyof typeof messages;

const DEFAULT_LOCALE: Locale = "it";
const COOKIE_KEY = "edison_locale";
const HEADER_KEY = "x-locale";

function isSupported(value: string): value is Locale {
	return value in messages;
}

/**
 * Picks the locale for a request: the cookie written by the language switcher
 * first, then an explicit X-Locale header for clients that call the API
 * directly, and Italian otherwise. The browser's Accept-Language is ignored on
 * purpose, so the interface and the responses never disagree.
 */
export function resolveLocale(event: H3Event): Locale {
	const cookie = getCookie(event, COOKIE_KEY);

	if (cookie && isSupported(cookie)) {
		return cookie;
	}

	const header = getRequestHeader(event, HEADER_KEY)?.trim().toLowerCase();

	if (header && isSupported(header)) {
		return header;
	}

	return DEFAULT_LOCALE;
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
