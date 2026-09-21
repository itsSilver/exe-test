<script setup lang="ts">
import { PRIORITIES, STATUSES, UNASSIGNED } from "#shared/schemas/activity";

const filters = defineModel<{
	status?: typeof STATUSES[number];
	priority?: typeof PRIORITIES[number];
	personCode?: string;
}>({ required: true });

const search = defineModel<string>("search", { required: true });

const props = defineProps<{ hasFilters: boolean; disabled: boolean }>();

const emit = defineEmits<{
	change: [key: "status" | "priority" | "personCode", value?: string];
	reset: [];
}>();

const { t } = useI18n();
const { status, priority } = useStatusMeta();
const { people } = usePeople();

const statusItems = computed(() => [
	{ label: t("activity.filters.allStatuses"), value: undefined },
	...STATUSES.map(code => ({ label: status(code).label, value: code })),
]);

const priorityItems = computed(() => [
	{ label: t("activity.filters.allPriorities"), value: undefined },
	...PRIORITIES.map(code => ({ label: priority(code).label, value: code })),
]);

const personItems = computed(() => [
	{ label: t("activity.filters.allPeople"), value: undefined },
	{ label: t("activity.unassigned"), value: UNASSIGNED },
	...people.value.map(person => ({
		label: formatCodeLabel(person.name, person.code),
		value: person.code,
	})),
]);
</script>

<template>
	<div class="flex flex-wrap items-center gap-2">
		<UInput
			v-model="search"
			class="w-full sm:w-64"
			icon="i-lucide-search"
			:placeholder="t('activity.filters.search')"
			:trailing-icon="search ? 'i-lucide-x' : undefined"
			:ui="{ trailing: 'pe-1' }"
		>
			<template
				v-if="search"
				#trailing
			>
				<UButton
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-x"
					:aria-label="t('activity.filters.reset')"
					@click="search = ''"
				/>
			</template>
		</UInput>

		<USelect
			:model-value="filters.status"
			:items="statusItems"
			value-key="value"
			icon="i-lucide-circle-dot"
			class="w-[calc(50%-0.25rem)] sm:w-40"
			:disabled="props.disabled"
			:placeholder="t('activity.filters.allStatuses')"
			@update:model-value="emit('change', 'status', $event)"
		/>

		<USelect
			:model-value="filters.priority"
			:items="priorityItems"
			value-key="value"
			icon="i-lucide-flag"
			class="w-[calc(50%-0.25rem)] sm:w-40"
			:disabled="props.disabled"
			:placeholder="t('activity.filters.allPriorities')"
			@update:model-value="emit('change', 'priority', $event)"
		/>

		<USelect
			:model-value="filters.personCode"
			:items="personItems"
			value-key="value"
			icon="i-lucide-user-round"
			class="w-full sm:w-56"
			:disabled="props.disabled"
			:placeholder="t('activity.filters.allPeople')"
			@update:model-value="emit('change', 'personCode', $event)"
		/>

		<UButton
			v-if="props.hasFilters"
			color="neutral"
			variant="ghost"
			icon="i-lucide-x"
			:disabled="props.disabled"
			:label="t('activity.filters.reset')"
			@click="emit('reset')"
		/>
	</div>
</template>
