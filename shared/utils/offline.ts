import type { ActivityInput } from "#shared/schemas/activity";

export interface PendingActivity {
	id: string;
	input: ActivityInput;
	createdAt: number;
}

/**
 * Tells a lost connection apart from a refusal by the server. A request that
 * never reached Nitro has no status code, while a rejected one carries the
 * envelope with its own message — only the first is worth queueing.
 */
export function isNetworkError(cause: unknown): boolean {
	const status = cause as { statusCode?: number; status?: number } | undefined;

	if (status?.statusCode || status?.status) {
		return false;
	}

	const name = (cause as { name?: string } | undefined)?.name ?? "";

	return name === "FetchError" || name === "TypeError" || cause instanceof Error;
}

/** Whether an insert should go to the queue instead of the network. */
export function shouldQueue(isOnline: boolean, cause?: unknown): boolean {
	if (!isOnline) {
		return true;
	}

	return cause !== undefined && isNetworkError(cause);
}
