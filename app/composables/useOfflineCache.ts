import { ACTIVITIES_CACHE } from "#shared/utils/cache";

/**
 * The ticket list is cached so it stays readable without a connection. It
 * belongs to whoever was logged in, so it is dropped on logout rather than
 * left for the next person to open the app.
 */
export function useOfflineCache() {
	async function clear() {
		if (!import.meta.client || !("caches" in window)) {
			return;
		}

		try {
			await caches.delete(ACTIVITIES_CACHE);
		}
		catch {
			// una cache non eliminabile non deve bloccare il logout
		}
	}

	return { clear };
}
