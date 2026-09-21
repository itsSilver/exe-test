import { LOCALE_COOKIE } from "../composables/useLocaleSwitcher";

/**
 * Applies the saved locale on startup, and writes the default one the first
 * time round so the server never has to guess from the browser headers.
 */
export default defineNuxtPlugin({
	name: "locale",
	dependsOn: ["i18n:plugin"],

	async setup(nuxtApp) {
		const i18n = nuxtApp.$i18n;

		const cookie = useCookie<string | null>(LOCALE_COOKIE, {
			maxAge: 60 * 60 * 24 * 365,
			path: "/",
			sameSite: "lax",
		});

		const saved = cookie.value;
		const isSupported = i18n.locales.value.some(entry => entry.code === saved);

		if (saved && isSupported) {
			if (saved !== i18n.locale.value) {
				await i18n.setLocale(saved as typeof i18n.locale.value);
			}

			return;
		}

		cookie.value = i18n.locale.value;
	},
});
