import type { Activity } from "#shared/schemas/activity";
import type { ApiErrorResponse, ApiResponse } from "#shared/types/api";

/** A single ticket, for the view and edit screens. */
export function useActivity(id: number) {
	const { data, status, error } = useFetch<ApiResponse<Activity>>(
		() => `/api/activities/${id}`,
		{ headers: useRequestHeaders(["cookie"]) },
	);

	const activity = computed(() => data.value?.data);
	const isLoading = computed(() => status.value === "pending");

	const errorMessage = computed(
		() => (error.value?.data as ApiErrorResponse | undefined)?.message ?? "",
	);

	return { activity, isLoading, errorMessage };
}
