import type { H3Event } from "h3";
import { describe, expect, it } from "vitest";
import { resolveLocale, t } from "./i18n";

function eventWith(headers: Record<string, string>): H3Event {
	return { node: { req: { headers } } } as unknown as H3Event;
}

describe("resolveLocale", () => {
	it("falls back to Italian when nothing is set", () => {
		expect(resolveLocale(eventWith({}))).toBe("it");
	});

	it("reads the cookie written by the language switcher", () => {
		expect(resolveLocale(eventWith({ cookie: "edison_locale=en" }))).toBe("en");
	});

	it("reads the X-Locale header for clients calling the API directly", () => {
		expect(resolveLocale(eventWith({ "x-locale": "en" }))).toBe("en");
	});

	it("accepts an X-Locale header in any case", () => {
		expect(resolveLocale(eventWith({ "x-locale": " EN " }))).toBe("en");
	});

	it("lets the cookie win over the header", () => {
		const event = eventWith({ "cookie": "edison_locale=it", "x-locale": "en" });

		expect(resolveLocale(event)).toBe("it");
	});

	it("ignores the browser's Accept-Language", () => {
		const event = eventWith({ "accept-language": "en-US,en;q=0.9" });

		expect(resolveLocale(event)).toBe("it");
	});

	it("ignores unsupported locales", () => {
		expect(resolveLocale(eventWith({ cookie: "edison_locale=de" }))).toBe("it");
		expect(resolveLocale(eventWith({ "x-locale": "de" }))).toBe("it");
	});

	it("survives a cookie header holding other cookies", () => {
		const event = eventWith({ cookie: "edison_session=abc; edison_locale=en" });

		expect(resolveLocale(event)).toBe("en");
	});
});

describe("t", () => {
	const italian = eventWith({});
	const english = eventWith({ "x-locale": "en" });

	it("translates a key for the request's locale", () => {
		expect(t(italian, "errors.databaseUnavailable")).toBe("Database non raggiungibile");
		expect(t(english, "errors.databaseUnavailable")).toBe("Database unavailable");
	});

	it("walks nested keys", () => {
		expect(t(italian, "auth.validation.userCodeRequired")).toBe(
			"Il codice utente è obbligatorio",
		);
	});

	it("interpolates parameters", () => {
		expect(t(italian, "auth.loggedInAs", { name: "UTENTE 01", code: "01" })).toBe(
			"Collegato come UTENTE 01 (01)",
		);
	});

	it("leaves a placeholder alone when no value is given", () => {
		expect(t(italian, "auth.loggedInAs", { name: "UTENTE 01" })).toBe(
			"Collegato come UTENTE 01 ({code})",
		);
	});

	it("returns the key itself when the message does not exist", () => {
		expect(t(italian, "errors.doesNotExist")).toBe("errors.doesNotExist");
	});

	it("does not return a partial path as a message", () => {
		expect(t(italian, "auth.validation")).toBe("auth.validation");
	});
});
