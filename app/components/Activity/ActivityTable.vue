<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Activity, SortField } from "#shared/schemas/activity";

const props = defineProps<{
	activities: Activity[];
	loading: boolean;
	sort: SortField;
	order: "asc" | "desc";
}>();

const emit = defineEmits<{ sort: [field: SortField] }>();

const { t } = useI18n();
const { status, priority } = useStatusMeta();

/**
 * The specification asks for the list grouped by person. In a table that reads
 * as the person being printed once per run rather than on every row.
 */
const rows = computed(() =>
	props.activities.map((activity, index) => ({
		...activity,
		showPerson: props.activities[index - 1]?.personCode !== activity.personCode,
	})),
);

const columns: TableColumn<Activity & { showPerson: boolean }>[] = [
	{ accessorKey: "personCode" },
	{ accessorKey: "date" },
	{ accessorKey: "customerCode" },
	{ accessorKey: "status" },
	{ accessorKey: "note" },
	{ id: "actions" },
];

const headers: { id: string; label: string; field?: SortField }[] = [
	{ id: "personCode", label: "activity.columns.person", field: "person" },
	{ id: "date", label: "activity.columns.date", field: "date" },
	{ id: "customerCode", label: "activity.columns.customer", field: "customer" },
	{ id: "status", label: "activity.columns.status", field: "priority" },
	{ id: "note", label: "activity.columns.note" },
	{ id: "actions", label: "activity.columns.actions" },
];

function sortIcon(field?: SortField) {
	if (!field || props.sort !== field) {
		return "i-lucide-chevrons-up-down";
	}

	return props.order === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down";
}
</script>

<template>
	<div class="relative">
		<UTable
			:data="rows"
			:columns="columns"
			:loading="loading"
			loading-color="primary"
			loading-animation="carousel"
			sticky
			class="rounded-lg border border-default"
			:class="loading && 'opacity-60 transition-opacity'"
		>
			<template
				v-for="header in headers"
				:key="header.id"
				#[`${header.id}-header`]
			>
				<UButton
					v-if="header.field"
					color="neutral"
					variant="ghost"
					size="xs"
					:label="t(header.label)"
					:trailing-icon="sortIcon(header.field)"
					:class="sort === header.field && 'text-primary'"
					@click="emit('sort', header.field)"
				/>
				<span
					v-else
					class="px-2 text-sm"
				>{{ t(header.label) }}</span>
			</template>

			<template #personCode-cell="{ row }">
				<span
					v-if="row.original.showPerson"
					class="font-medium"
				>
					{{ row.original.personCode
						? formatCodeLabel(row.original.personName, row.original.personCode)
						: t("activity.unassigned") }}
				</span>
				<span
					v-else
					class="text-dimmed"
				>—</span>
			</template>

			<template #date-cell="{ row }">
				<span class="tabular-nums">{{ formatDate(row.original.date) }}</span>
			</template>

			<template #customerCode-cell="{ row }">
				{{ formatCodeLabel(row.original.customerName, row.original.customerCode) }}
			</template>

			<template #status-cell="{ row }">
				<div class="flex items-center gap-1.5">
					<UBadge
						size="sm"
						variant="subtle"
						:color="status(row.original.status).color"
						:label="status(row.original.status).label"
					/>
					<UBadge
						size="sm"
						variant="outline"
						:color="priority(row.original.priority).color"
						:label="priority(row.original.priority).label"
					/>
				</div>
			</template>

			<template #note-cell="{ row }">
				<span class="line-clamp-1 max-w-sm text-muted">
					{{ row.original.note || t("activity.noNote") }}
				</span>
			</template>

			<template #actions-cell="{ row }">
				<div class="flex items-center justify-end gap-1">
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						icon="i-lucide-eye"
						:aria-label="t('activity.actions.view')"
						:to="`/attivita/${row.original.id}`"
					/>
					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						icon="i-lucide-pencil"
						:aria-label="t('activity.actions.edit')"
						:to="`/attivita/${row.original.id}/modifica`"
					/>
				</div>
			</template>
		</UTable>

		<!-- le righe restano visibili e attenuate finché non arriva la pagina nuova -->
		<div
			v-if="loading"
			class="pointer-events-none absolute inset-0 flex items-start justify-center pt-20"
		>
			<span class="flex items-center gap-2 rounded-full border border-default bg-default px-3 py-1.5 text-xs shadow-sm">
				<UIcon
					name="i-lucide-loader-circle"
					class="size-3.5 animate-spin"
				/>
				{{ t("common.loading") }}
			</span>
		</div>
	</div>
</template>
