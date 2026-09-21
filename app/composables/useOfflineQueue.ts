import type { Activity, ActivityInput } from "#shared/schemas/activity";
import type { PendingActivity } from "#shared/utils/offline";
import type { ApiResponse } from "#shared/types/api";

const DB_NAME = "edison-offline";
const STORE = "pending-activities";
const pending = ref<PendingActivity[]>([]);
const isFlushing = ref(false);

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = () => {
			request.result.createObjectStore(STORE, { keyPath: "id" });
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
	return openDb().then(db => new Promise<T>((resolve, reject) => {
		const request = work(db.transaction(STORE, mode).objectStore(STORE));

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	}));
}

/**
 * Activities created without a connection wait here until one comes back.
 * Only inserts are queued: IDREC is assigned by a trigger, so a queued insert
 * simply gets its identity when it finally reaches the server, while a queued
 * edit could overwrite work done in Edison PLUS in the meantime.
 */
export function useOfflineQueue() {
	const isOnline = useOnline();

	async function refresh() {
		if (!import.meta.client || !("indexedDB" in window)) {
			return;
		}

		try {
			pending.value = await run<PendingActivity[]>("readonly", store => store.getAll());
		}
		catch {
			pending.value = [];
		}
	}

	async function enqueue(input: ActivityInput) {
		const item: PendingActivity = {
			id: crypto.randomUUID(),
			input,
			createdAt: Date.now(),
		};

		await run("readwrite", store => store.add(item));
		await refresh();

		return item;
	}

	async function flush() {
		if (!import.meta.client || isFlushing.value || !isOnline.value) {
			return 0;
		}

		await refresh();

		if (!pending.value.length) {
			return 0;
		}

		isFlushing.value = true;
		let sent = 0;

		try {
			for (const item of [...pending.value]) {
				try {
					await $fetch<ApiResponse<Activity>>("/api/activities", {
						method: "POST",
						body: item.input,
					});

					await run("readwrite", store => store.delete(item.id));
					sent += 1;
				}
				catch (cause) {
					// una risposta del server è definitiva: la riga non va rimessa
					// in coda all'infinito, quindi viene scartata
					if (!isNetworkError(cause)) {
						await run("readwrite", store => store.delete(item.id));
						continue;
					}

					break;
				}
			}
		}
		finally {
			isFlushing.value = false;
			await refresh();
		}

		return sent;
	}

	return { pending, isFlushing, isOnline, refresh, enqueue, flush };
}
