<script setup lang="ts">
import type { ApiResponse } from "#shared/types/api";
import { MIN_CUSTOMER_SEARCH_LENGTH } from "#shared/utils/search";

interface Customer {
	code: string;
	name: string;
	address: string;
	city: string;
	status: string;
}

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{ select: [customer: Customer] }>();

const { t } = useI18n();

const term = ref("");
const results = ref<Customer[]>([]);
const isSearching = ref(false);

// la ricerca parte da 4 caratteri, come da specifica
watchDebounced(term, async (value) => {
	if (value.trim().length < MIN_CUSTOMER_SEARCH_LENGTH) {
		results.value = [];
		return;
	}

	isSearching.value = true;

	try {
		const response = await $fetch<ApiResponse<Customer[]>>("/api/customers", {
			query: { search: value.trim() },
		});

		results.value = response.data;
	}
	finally {
		isSearching.value = false;
	}
}, { debounce: 300 });
</script>

<template>
	<UModal
		v-model:open="open"
		:title="t('activity.picker.customer')"
		:description="t('activity.picker.customerHint', { count: MIN_CUSTOMER_SEARCH_LENGTH })"
	>
		<template #body>
			<UInput
				v-model="term"
				autofocus
				class="w-full"
				icon="i-lucide-search"
				:loading="isSearching"
				:placeholder="t('activity.picker.customerPlaceholder')"
			/>

			<p
				v-if="term.trim().length > 0 && term.trim().length < MIN_CUSTOMER_SEARCH_LENGTH"
				class="mt-3 text-sm text-muted"
			>
				{{ t("activity.picker.customerHint", { count: MIN_CUSTOMER_SEARCH_LENGTH }) }}
			</p>

			<p
				v-else-if="!isSearching && term.trim().length >= MIN_CUSTOMER_SEARCH_LENGTH && !results.length"
				class="mt-3 text-sm text-muted"
			>
				{{ t("activity.picker.noResults") }}
			</p>

			<div class="mt-3 max-h-80 divide-y divide-default overflow-y-auto">
				<button
					v-for="customer in results"
					:key="customer.code"
					type="button"
					class="w-full px-2 py-2.5 text-left hover:bg-elevated"
					@click="emit('select', customer); open = false"
				>
					<div class="flex items-center justify-between gap-2">
						<span class="text-sm font-medium">
							{{ formatCodeLabel(customer.name, customer.code) }}
						</span>
						<UBadge
							v-if="customer.status"
							size="sm"
							color="neutral"
							variant="subtle"
							:label="customer.status"
						/>
					</div>
					<p class="text-xs text-muted">
						{{ [customer.address, customer.city].filter(Boolean).join(" · ") }}
					</p>
				</button>
			</div>
		</template>
	</UModal>
</template>
