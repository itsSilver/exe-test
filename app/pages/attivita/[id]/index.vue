<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const notify = useNotify();

const { activity, isLoading, errorMessage } = useActivity(Number(route.params.id));

const deleting = ref(false);

async function onRemove() {
	deleting.value = true;

	try {
		const response = await $fetch<{ message: string }>(`/api/activities/${route.params.id}`, {
			method: "DELETE",
		});

		notify.success(response.message);
		await navigateTo("/attivita");
	}
	catch (error) {
		notify.error(error);
	}
	finally {
		deleting.value = false;
	}
}
</script>

<template>
	<UContainer class="py-4">
		<ActivityHeader :title="t('activity.form.viewTitle')" />

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
			mode="view"
			:activity="activity"
			:deleting="deleting"
			@remove="onRemove"
		/>
	</UContainer>
</template>
