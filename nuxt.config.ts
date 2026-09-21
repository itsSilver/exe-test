export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/ui",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		"@nuxtjs/turnstile",
		"@nuxtjs/i18n",
	],

	devtools: { enabled: false },

	css: ["~/assets/css/main.css"],

	runtimeConfig: {
		firebird: {
			host: process.env.FIREBIRD_HOST || "localhost",
			port: process.env.FIREBIRD_PORT || "3050",
			database:
				process.env.FIREBIRD_DATABASE || "/firebird/data/EDISONFDB_DATI.FDB",
			user: process.env.FIREBIRD_USER || "SYSDBA",
			password: process.env.FIREBIRD_PASSWORD || "masterkey",
		},
		sessionSecret: process.env.SESSION_SECRET || "dev-secret",
	},

	compatibilityDate: "2025-09-01",

	eslint: {
		config: {
			stylistic: {
				indent: "tab",
				quotes: "double",
				semi: true,
			},
		},
	},

	i18n: {
		defaultLocale: "it",
		strategy: "no_prefix",
		locales: [
			{ code: "it", language: "it-IT", name: "Italiano", file: "it.json" },
			{ code: "en", language: "en-US", name: "English", file: "en.json" },
		],
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "edison_locale",
			redirectOn: "root",
		},
	},

	turnstile: {
		siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
	},
});
