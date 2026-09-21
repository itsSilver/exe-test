<script setup lang="ts">
import type { Activity, ActivityInput } from "#shared/schemas/activity";
import type { ApiResponse } from "#shared/types/api";

const { t } = useI18n();
const route = useRoute();
const notify = useNotify();

const { activity, isLoading, errorMessage } = useActivity(Number(route.params.id));

const saving = ref(false);

async function onSubmit(input: ActivityInput) {
	saving.value = true;

	try {
		const response = await $fetch<ApiResponse<Activity>>(`/api/activities/${route.params.id}`, {
			method: "PUT",
			body: input,
		});

		notify.success(response.message);
		await navigateTo(`/attivita/${response.data.id}`);
	}
	catch (error) {
		notify.error(error);
	}
	finally {
		saving.value = false;
	}
}
</script>

<template>
	<UContainer class="py-4">
		<ActivityHeader :title="t('activity.form.editTitle')" />

		<USkeleton
			v-if="isLoading"
			class="h-96 w-full rounded-lg"
		/>

		<UAlert
			v-else-if="!activity"
			color="error"
			variant="subtle"
			icon="i-lucide-circle-alert"
			:title="t('errors.activityNotFound')"
			:description="errorMessage"
		/>

		<ActivityForm
			v-else
			mode="edit"
			:activity="activity"
			:saving="saving"
			@submit="onSubmit"
		/>
	</UContainer>
</template>
