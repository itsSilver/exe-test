import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["**/*.test.ts"],
		exclude: ["node_modules", ".nuxt", ".output"],
	},
	resolve: {
		alias: {
			"#shared": fileURLToPath(new URL("./shared", import.meta.url)),
		},
	},
});
