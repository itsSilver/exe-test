import type { Activity, ActivityQuery, SortField } from "#shared/schemas/activity";
import type { ApiErrorResponse, ApiPaginatedResponse } from "#shared/types/api";

export const PAGE_SIZE = 20;

/** The ticket list with its filters and page, kept in sync with the query string. */
export function useActivities() {
	const route = useRoute();
	const router = useRouter();

	const filters = reactive({
		page: Number(route.query.page ?? 1),
		limit: PAGE_SIZE,
		status: (route.query.status as ActivityQuery["status"]) || undefined,
		priority: (route.query.priority as ActivityQuery["priority"]) || undefined,
		personCode: (route.query.personCode as string) || undefined,
		search: (route.query.search as string) || undefined,
		sort: (route.query.sort as SortField) || "date",
		order: (route.query.order as "asc" | "desc") || "desc",
	});

	const { data, status, error, refresh } = useFetch<ApiPaginatedResponse<Activity>>(
		"/api/activities",
		{
			query: filters,
			headers: useRequestHeaders(["cookie"]),
		},
	);

	const activities = computed(() => data.value?.data ?? []);
	const groups = computed(() => groupByPerson(activities.value));
	const meta = computed(() => data.value?.meta);
	const total = computed(() => meta.value?.total ?? 0);
	const isLoading = computed(() => status.value === "pending");

	const errorMessage = computed(
		() => (error.value?.data as ApiErrorResponse | undefined)?.message ?? "",
	);

	const hasFilters = computed(
		() => Boolean(filters.status || filters.priority || filters.personCode || filters.search),
	);

	/*
	 * The typed term is debounced before it reaches the query, so a search is
	 * one request when the user stops typing rather than one per keystroke.
	 */
	const search = ref(filters.search ?? "");

	watchDebounced(search, (value) => {
		const term = value.trim();

		filters.search = isSearchable(term) ? term : undefined;
		filters.page = 1;
	}, { debounce: 350 });

	// la pagina torna alla prima quando cambia un filtro, altrimenti si
	// resterebbe su una pagina che non esiste più
	function setFilter<K extends "status" | "priority" | "personCode">(key: K, value: (typeof filters)[K]) {
		filters[key] = value;
		filters.page = 1;
	}

	/** Clicking the same column again flips the direction. */
	function setSort(field: SortField) {
		if (filters.sort === field) {
			filters.order = filters.order === "asc" ? "desc" : "asc";
		}
		else {
			filters.sort = field;
			filters.order = field === "date" ? "desc" : "asc";
		}

		filters.page = 1;
	}

	function reset() {
		search.value = "";
		filters.status = undefined;
		filters.priority = undefined;
		filters.search = undefined;
		filters.personCode = undefined;
		filters.page = 1;
	}

	watch(filters, (value) => {
		router.replace({
			query: {
				...(value.page > 1 ? { page: value.page } : {}),
				...(value.status ? { status: value.status } : {}),
				...(value.priority ? { priority: value.priority } : {}),
				...(value.personCode ? { personCode: value.personCode } : {}),
				...(value.search ? { search: value.search } : {}),
				...(value.sort !== "date" ? { sort: value.sort } : {}),
				...(value.order !== "desc" ? { order: value.order } : {}),
			},
		});
	});

	return {
		filters,
		search,
		activities,
		groups,
		meta,
		total,
		isLoading,
		error,
		errorMessage,
		hasFilters,
		setFilter,
		setSort,
		reset,
		refresh,
	};
}
