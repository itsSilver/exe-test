<script setup lang="ts">
import type { Activity, ActivityInput } from "#shared/schemas/activity";
import type { ApiResponse } from "#shared/types/api";

const { t } = useI18n();
const notify = useNotify();

const saving = ref(false);

async function onSubmit(input: ActivityInput) {
	saving.value = true;

	try {
		const response = await $fetch<ApiResponse<Activity>>("/api/activities", {
			method: "POST",
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
		<ActivityHeader :title="t('activity.form.insertTitle')" />

		<ActivityForm
			mode="insert"
			:saving="saving"
			@submit="onSubmit"
		/>
	</UContainer>
</template>
