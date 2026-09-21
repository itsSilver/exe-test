import type { ApiResponse } from "#shared/types/api";

interface Person {
	code: string;
	name: string;
}

/** TBPERS, alphabetical, for the assignee filter and the detail form picker. */
export function usePeople() {
	const { data } = useFetch<ApiResponse<Person[]>>("/api/people", {
		headers: useRequestHeaders(["cookie"]),
		lazy: true,
	});

	const people = computed(() => data.value?.data ?? []);

	return { people };
}
