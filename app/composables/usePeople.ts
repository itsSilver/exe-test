import type { LookupItem } from "#shared/schemas/lookup";
import type { ApiPaginatedResponse } from "#shared/types/api";

/** The whole of TBPERS, for the filter dropdown on the list screen. */
export function usePeople() {
	const { data } = useFetch<ApiPaginatedResponse<LookupItem>>("/api/people", {
		query: { limit: 200 },
		headers: useRequestHeaders(["cookie"]),
		lazy: true,
	});

	const people = computed(() => data.value?.data ?? []);

	return { people };
}
