import { ACTIVITIES_CACHE } from "./shared/utils/cache";

export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/ui",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		"@nuxtjs/turnstile",
		"@nuxtjs/i18n",
		"@vite-pwa/nuxt",
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
		// la lingua di default è sempre l'italiano: il browser non decide,
		// decide l'utente con il selettore
		detectBrowserLanguage: false,
	},

	pwa: {
		registerType: "autoUpdate",

		manifest: {
			name: "Edison Cloud",
			short_name: "Edison Cloud",
			description: "Attività e ticket clienti di Edison PLUS",
			lang: "it",
			display: "standalone",
			orientation: "portrait",
			start_url: "/",
			background_color: "#ffffff",
			theme_color: "#0284c7",
			icons: [
				{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
				{ src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
				{
					src: "/pwa-maskable-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "maskable",
				},
			],
		},

		workbox: {
			navigateFallback: "/",
			globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
			runtimeCaching: [
				{
					// l'ultima lista resta leggibile anche senza rete
					urlPattern: /\/api\/activities$/,
					handler: "NetworkFirst",
					options: {
						cacheName: ACTIVITIES_CACHE,
						networkTimeoutSeconds: 3,
						cacheableResponse: { statuses: [200] },
						expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
					},
				},
			],
		},

		client: {
			installPrompt: true,
		},

		devOptions: {
			enabled: true,
			suppressWarnings: true,
			type: "module",
		},
	},

	turnstile: {
		siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
	},
});
