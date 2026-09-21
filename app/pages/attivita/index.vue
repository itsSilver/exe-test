<script setup lang="ts">
const { t } = useI18n();
const {
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
} = useActivities();

const { play } = useStagger();

watch(activities, async (value) => {
	if (!value.length) {
		return;
	}

	await nextTick();
	play(".activity-card");
}, { immediate: true });
</script>

<template>
	<UContainer class="py-4">
		<div class="mb-4 flex flex-col gap-3">
			<div class="flex items-center justify-between gap-3">
				<div>
					<h1 class="text-lg font-semibold">
						{{ t("activity.title") }}
					</h1>
					<p class="text-xs text-muted">
						{{ t("activity.count", { count: total }) }}
					</p>
				</div>

				<!-- su desktop accanto ai filtri, sul telefono è il bottone flottante -->
				<UButton
					class="hidden md:inline-flex"
					color="primary"
					icon="i-lucide-plus"
					:label="t('activity.actions.insert')"
					to="/attivita/nuovo"
				/>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3">
				<ActivityFilters
					v-model="filters"
					v-model:search="search"
					class="grow"
					:has-filters="hasFilters"
					:disabled="isLoading"
					@change="setFilter"
					@reset="reset"
				/>
			</div>
		</div>

		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-lucide-circle-alert"
			:title="t('errors.generic')"
			:description="errorMessage"
		/>

		<div
			v-else-if="!isLoading && !activities.length"
			class="rounded-lg border border-dashed border-default p-10 text-center"
		>
			<UIcon
				name="i-lucide-inbox"
				class="size-8 text-dimmed"
			/>
			<p class="mt-2 text-sm text-muted">
				{{ hasFilters ? t("activity.emptyFiltered") : t("activity.empty") }}
			</p>
			<UButton
				v-if="hasFilters"
				class="mt-3"
				color="neutral"
				variant="subtle"
				:disabled="isLoading"
				:label="t('activity.filters.reset')"
				@click="reset"
			/>
		</div>

		<template v-else>
			<div class="hidden md:block">
				<ActivityTable
					:activities="activities"
					:loading="isLoading"
					:sort="filters.sort"
					:order="filters.order"
					@sort="setSort"
				/>
			</div>

			<div class="flex flex-col gap-5 md:hidden">
				<div
					v-if="isLoading"
					class="flex flex-col gap-2"
				>
					<USkeleton
						v-for="n in 5"
						:key="n"
						class="h-28 w-full rounded-lg"
					/>
				</div>

				<ActivityGroup
					v-for="group in groups"
					v-else
					:key="group.personCode || 'unassigned'"
					:group="group"
				/>
			</div>
		</template>

		<div
			v-if="meta && meta.totalPages > 1"
			class="mt-6 flex justify-center"
		>
			<UPagination
				v-model:page="filters.page"
				:total="meta.total"
				:items-per-page="meta.limit"
				:disabled="isLoading"
			/>
		</div>

		<UButton
			class="fixed bottom-6 end-6 z-10 rounded-full shadow-lg md:hidden"
			color="primary"
			size="xl"
			icon="i-lucide-plus"
			:aria-label="t('activity.actions.insert')"
			to="/attivita/nuovo"
		/>
	</UContainer>
</template>
