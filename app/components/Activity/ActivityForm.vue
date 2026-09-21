<script setup lang="ts">
import type { Activity, ActivityInput } from "#shared/schemas/activity";
import { activityInputSchema, PRIORITIES, STATUSES } from "#shared/schemas/activity";

const props = defineProps<{
	mode: "view" | "edit" | "insert";
	activity?: Activity;
	saving?: boolean;
	deleting?: boolean;
}>();

const emit = defineEmits<{
	submit: [input: ActivityInput];
	remove: [];
}>();

const { t } = useI18n();
const { status, priority } = useStatusMeta();

const isReadonly = computed(() => props.mode === "view");
const validate = useZodValidator(activityInputSchema);

const state = reactive<ActivityInput>({
	customerCode: props.activity?.customerCode ?? "",
	personCode: props.activity?.personCode ?? "",
	date: props.activity?.date ?? toIsoDate(new Date()),
	hours: props.activity?.hours ?? 0,
	workTypeCode: props.activity?.workTypeCode ?? "",
	status: props.activity?.status ?? "A",
	priority: props.activity?.priority ?? "B",
	referencePerson: props.activity?.referencePerson ?? "",
	note: props.activity?.note ?? "",
	revision: props.activity?.revision,
});

// le etichette mostrano "descrizione (codice)" anche prima di ricaricare la riga
const customerName = ref(props.activity?.customerName ?? "");

const personName = ref(props.activity?.personName ?? "");
const workTypeName = ref(props.activity?.workTypeName ?? "");

const personLabel = computed(() =>
	state.personCode ? formatCodeLabel(personName.value, state.personCode) : "",
);

const workTypeLabel = computed(() =>
	state.workTypeCode ? formatCodeLabel(workTypeName.value, state.workTypeCode) : "",
);

const customerLabel = computed(() =>
	state.customerCode ? formatCodeLabel(customerName.value, state.customerCode) : "",
);

const form = useTemplateRef<{ clear: (path?: string) => void }>("form");

/*
 * The customer, person and work type fields are filled from a modal, so the
 * input itself never blurs and UForm would keep showing the error until some
 * other field is touched. Clearing it as soon as a value arrives keeps the
 * three pickers behaving like the ordinary inputs next to them.
 */
watch(() => state.customerCode, value => value && form.value?.clear("customerCode"));
watch(() => state.personCode, value => value && form.value?.clear("personCode"));
watch(() => state.workTypeCode, value => value && form.value?.clear("workTypeCode"));
watch(() => state.hours, value => value > 0 && form.value?.clear("hours"));

const isCustomerOpen = ref(false);
const isPersonOpen = ref(false);
const isWorkTypeOpen = ref(false);
const isDeleteOpen = ref(false);

/**
 * The specification lets the user type either minutes or hours. Minutes are
 * converted to decimal hours (15 becomes 0,25) before they reach NORE.
 */
const unit = ref<"hours" | "minutes">("hours");
const amount = ref(props.activity?.hours ?? 0);

const unitItems = computed(() => [
	{ label: t("activity.form.hours"), value: "hours" },
	{ label: t("activity.form.minutes"), value: "minutes" },
]);

watch([amount, unit], ([value, current]) => {
	state.hours = current === "minutes" ? minutesToHours(Number(value) || 0) : round(Number(value) || 0);
});

const statusItems = computed(() => STATUSES.map(code => ({ label: status(code).label, value: code })));
const priorityItems = computed(() => PRIORITIES.map(code => ({ label: priority(code).label, value: code })));
</script>

<template>
	<UForm
		ref="form"
		:validate="validate"
		:state="state"
		class="space-y-4"
		@submit="emit('submit', { ...state })"
	>
		<UFormField
			:label="t('activity.columns.customer')"
			name="customerCode"
			required
		>
			<UFieldGroup class="w-full">
				<UInput
					class="w-full"
					readonly
					:class="!isReadonly && 'cursor-pointer'"
					:model-value="customerLabel"
					:placeholder="t('activity.form.chooseCustomer')"
					@click="!isReadonly && (isCustomerOpen = true)"
				/>
				<UButton
					v-if="!isReadonly"
					color="neutral"
					variant="subtle"
					icon="i-lucide-search"
					:aria-label="t('activity.picker.customer')"
					@click="isCustomerOpen = true"
				/>
			</UFieldGroup>
		</UFormField>

		<div class="grid gap-4 sm:grid-cols-2">
			<UFormField
				:label="t('activity.columns.date')"
				name="date"
				required
			>
				<UInput
					v-model="state.date"
					class="w-full"
					type="date"
					:disabled="isReadonly"
				/>
			</UFormField>

			<UFormField
				:label="t('activity.columns.person')"
				name="personCode"
				required
			>
				<UFieldGroup class="w-full">
					<UInput
						class="w-full"
						readonly
						:class="!isReadonly && 'cursor-pointer'"
						:model-value="personLabel"
						:placeholder="t('activity.form.choosePerson')"
						@click="!isReadonly && (isPersonOpen = true)"
					/>
					<UButton
						v-if="!isReadonly"
						color="neutral"
						variant="subtle"
						icon="i-lucide-list"
						:aria-label="t('activity.picker.person')"
						@click="isPersonOpen = true"
					/>
				</UFieldGroup>
			</UFormField>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<UFormField
				:label="t('activity.form.duration')"
				name="hours"
				required
				:hint="state.hours > 0 ? formatHours(state.hours) : undefined"
			>
				<UFieldGroup class="w-full">
					<UInput
						v-model="amount"
						class="w-full"
						type="number"
						min="0"
						step="0.01"
						:disabled="isReadonly"
					/>
					<USelect
						v-model="unit"
						:items="unitItems"
						value-key="value"
						:disabled="isReadonly"
						class="w-32"
					/>
				</UFieldGroup>
			</UFormField>

			<UFormField
				:label="t('activity.form.workType')"
				name="workTypeCode"
			>
				<UFieldGroup class="w-full">
					<UInput
						class="w-full"
						readonly
						:class="!isReadonly && 'cursor-pointer'"
						:model-value="workTypeLabel"
						:placeholder="t('activity.form.chooseWorkType')"
						@click="!isReadonly && (isWorkTypeOpen = true)"
					/>
					<UButton
						v-if="!isReadonly"
						color="neutral"
						variant="subtle"
						icon="i-lucide-list"
						:aria-label="t('activity.picker.workType')"
						@click="isWorkTypeOpen = true"
					/>
				</UFieldGroup>
			</UFormField>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<UFormField
				:label="t('activity.columns.status')"
				name="status"
				required
			>
				<USelect
					v-model="state.status"
					class="w-full"
					:items="statusItems"
					value-key="value"
					:disabled="isReadonly"
				/>
			</UFormField>

			<UFormField
				:label="t('activity.form.priority')"
				name="priority"
				required
			>
				<USelect
					v-model="state.priority"
					class="w-full"
					:items="priorityItems"
					value-key="value"
					:disabled="isReadonly"
				/>
			</UFormField>
		</div>

		<UFormField
			:label="t('activity.form.referencePerson')"
			name="referencePerson"
		>
			<UInput
				v-model="state.referencePerson"
				class="w-full"
				maxlength="25"
				:disabled="isReadonly"
			/>
		</UFormField>

		<UFormField
			:label="t('activity.form.note')"
			name="note"
			required
		>
			<UTextarea
				v-model="state.note"
				class="w-full"
				:rows="4"
				:disabled="isReadonly"
			/>
		</UFormField>

		<div class="flex flex-wrap items-center gap-2 pt-2">
			<UButton
				v-if="!isReadonly"
				type="submit"
				icon="i-lucide-check"
				:loading="saving"
				:label="t('activity.form.confirm')"
			/>

			<UButton
				color="neutral"
				variant="subtle"
				icon="i-lucide-arrow-left"
				:label="t('activity.form.cancel')"
				to="/attivita"
			/>

			<!-- la cancellazione è attiva solo in visualizzazione, come da specifica -->
			<UButton
				v-if="isReadonly"
				class="ms-auto"
				color="error"
				variant="subtle"
				icon="i-lucide-trash-2"
				:loading="deleting"
				:label="t('activity.form.delete')"
				@click="isDeleteOpen = true"
			/>

			<UButton
				v-if="isReadonly"
				color="primary"
				icon="i-lucide-pencil"
				:label="t('activity.actions.edit')"
				:to="`/attivita/${activity?.id}/modifica`"
			/>
		</div>

		<ActivityCustomerPickerModal
			v-model:open="isCustomerOpen"
			@select="(customer) => { state.customerCode = customer.code; customerName = customer.name; }"
		/>

		<ActivityListPickerModal
			v-model:open="isPersonOpen"
			endpoint="/api/people"
			:title="t('activity.picker.person')"
			:selected="state.personCode"
			@select="(item) => { state.personCode = item.code; personName = item.name; }"
		/>

		<ActivityListPickerModal
			v-model:open="isWorkTypeOpen"
			endpoint="/api/work-types"
			:title="t('activity.picker.workType')"
			:selected="state.workTypeCode"
			@select="(item) => { state.workTypeCode = item.code; workTypeName = item.name; }"
		/>

		<UModal
			v-model:open="isDeleteOpen"
			:title="t('activity.form.deleteTitle')"
			:description="t('activity.form.deleteConfirm')"
		>
			<template #footer>
				<UButton
					color="neutral"
					variant="subtle"
					:label="t('activity.form.cancel')"
					@click="isDeleteOpen = false"
				/>
				<UButton
					color="error"
					icon="i-lucide-trash-2"
					:loading="deleting"
					:label="t('activity.form.delete')"
					@click="isDeleteOpen = false; emit('remove')"
				/>
			</template>
		</UModal>
	</UForm>
</template>
