import type { LookupItem } from "#shared/schemas/lookup";
import type { ApiPaginatedResponse } from "#shared/types/api";

const PAGE_SIZE = 10;

/**
 * A picker list that arrives ten rows at a time. Searching restarts at the
 * first page, and scrolling to the bottom appends the next one, so opening a
 * picker never pulls a whole table down the wire.
 */
export function useLookup(endpoint: string) {
	const items = ref<LookupItem[]>([]);
	const search = ref("");
	const page = ref(1);
	const total = ref(0);
	const isLoading = ref(false);

	const hasMore = computed(() => items.value.length < total.value);

	async function load(reset: boolean) {
		if (isLoading.value) {
			return;
		}

		isLoading.value = true;
		page.value = reset ? 1 : page.value + 1;

		try {
			const response = await $fetch<ApiPaginatedResponse<LookupItem>>(endpoint, {
				query: { search: search.value.trim(), page: page.value, limit: PAGE_SIZE },
			});

			items.value = reset ? response.data : [...items.value, ...response.data];
			total.value = response.meta.total;
		}
		finally {
			isLoading.value = false;
		}
	}

	watchDebounced(search, () => load(true), { debounce: 300 });

	function loadMore() {
		if (hasMore.value) {
			load(false);
		}
	}

	return { items, search, total, hasMore, isLoading, load, loadMore };
}
