export const LOCALE_COOKIE = "edison_locale";

/**
 * Keeps the chosen locale in a cookie so the Nitro routes answer in the same
 * language as the interface. Without it the API would fall back to the
 * Accept-Language header and could disagree with what is on screen.
 */
export function useLocaleSwitcher() {
	const { locale, locales, setLocale } = useI18n();

	const cookie = useCookie<string | null>(LOCALE_COOKIE, {
		maxAge: 60 * 60 * 24 * 365,
		path: "/",
		sameSite: "lax",
	});

	const options = computed(() =>
		locales.value.map(entry => ({
			value: entry.code,
			label: entry.name ?? entry.code,
		})),
	);

	async function select(code: string) {
		if (code === locale.value) {
			return;
		}

		cookie.value = code;
		await setLocale(code as typeof locale.value);
	}

	return { locale, options, select, cookie };
}
