/**
 * Safari has no Background Sync, and the specification targets iOS as well as
 * Android, so the queue is also replayed whenever the app regains a connection
 * or is simply reopened. Sending twice is prevented by the flush itself, which
 * removes each row before moving on.
 */
export default defineNuxtPlugin(() => {
	const { flush, isOnline, refresh } = useOfflineQueue();

	refresh();

	watch(isOnline, (online) => {
		if (online) {
			flush();
		}
	});

	if (isOnline.value) {
		flush();
	}
});
