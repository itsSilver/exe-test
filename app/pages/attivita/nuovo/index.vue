<script setup lang="ts">
import type { Activity, ActivityInput } from "#shared/schemas/activity";
import type { ApiResponse } from "#shared/types/api";
import { shouldQueue } from "#shared/utils/offline";

const { t } = useI18n();
const notify = useNotify();
const { enqueue, isOnline } = useOfflineQueue();

const saving = ref(false);

async function queueAndLeave(input: ActivityInput) {
	await enqueue(input);
	notify.success(t("offline.queued"));
	await navigateTo("/attivita");
}

async function onSubmit(input: ActivityInput) {
	saving.value = true;

	try {
		// senza rete l'attività va in coda e parte alla riconnessione
		if (shouldQueue(isOnline.value)) {
			await queueAndLeave(input);
			return;
		}

		const response = await $fetch<ApiResponse<Activity>>("/api/activities", {
			method: "POST",
			body: input,
		});

		notify.success(response.message);
		await navigateTo(`/attivita/${response.data.id}`);
	}
	catch (error) {
		if (shouldQueue(isOnline.value, error)) {
			await queueAndLeave(input);
			return;
		}

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

		<UAlert
			v-if="!isOnline"
			class="mb-4"
			color="warning"
			variant="subtle"
			icon="i-lucide-wifi-off"
			:title="t('offline.insertTitle')"
			:description="t('offline.insertDescription')"
		/>

		<ActivityForm
			mode="insert"
			:saving="saving"
			@submit="onSubmit"
		/>
	</UContainer>
</template>
