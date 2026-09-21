<script setup lang="ts">
import type { LookupItem } from "#shared/schemas/lookup";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{
	title: string;
	endpoint: string;
	selected?: string;
}>();

const emit = defineEmits<{ select: [item: LookupItem] }>();

const { t } = useI18n();
const { items, search, total, hasMore, isLoading, load, loadMore } = useLookup(props.endpoint);

const sentinel = ref<HTMLElement | null>(null);

// il fondo della lista chiede la pagina successiva
useIntersectionObserver(sentinel, ([entry]) => {
	if (entry?.isIntersecting) {
		loadMore();
	}
});

watch(open, (value) => {
	if (value && !items.value.length) {
		load(true);
	}
});
</script>

<template>
	<UModal
		v-model:open="open"
		:title="title"
	>
		<template #body>
			<UInput
				v-model="search"
				class="w-full"
				icon="i-lucide-search"
				:loading="isLoading"
				:placeholder="t('activity.picker.filter')"
			/>

			<div class="mt-3 max-h-80 overflow-y-auto">
				<UButton
					v-for="item in items"
					:key="item.code"
					class="w-full justify-start"
					color="neutral"
					:variant="item.code === props.selected ? 'soft' : 'ghost'"
					@click="emit('select', item); open = false"
				>
					{{ formatCodeLabel(item.name, item.code) }}
				</UButton>

				<p
					v-if="!isLoading && !items.length"
					class="px-2 py-3 text-sm text-muted"
				>
					{{ t("activity.picker.noResults") }}
				</p>

				<div
					ref="sentinel"
					class="h-8"
				/>

				<p
					v-if="hasMore"
					class="px-2 pb-1 text-center text-xs text-muted"
				>
					{{ t("activity.picker.more", { shown: items.length, total }) }}
				</p>
			</div>
		</template>
	</UModal>
</template>
