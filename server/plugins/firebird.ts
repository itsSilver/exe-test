import { closePool } from "../db/client";

export default defineNitroPlugin((nitro) => {
	nitro.hooks.hook("close", async () => {
		await closePool();
	});
});
