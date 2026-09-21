<script setup lang="ts">
const { t } = useI18n();
const { data, error } = await useFetch("/api/health");
</script>

<template>
	<UContainer class="py-12">
		<h1 class="text-2xl font-semibold">
			{{ t("app.name") }}
		</h1>

		<UAlert
			v-if="error"
			class="mt-6"
			color="error"
			variant="subtle"
			icon="i-lucide-circle-alert"
			:title="t('errors.databaseUnavailable')"
			:description="error.statusMessage"
		/>

		<UAlert
			v-else
			class="mt-6"
			color="success"
			variant="subtle"
			icon="i-lucide-database"
			:title="data?.message"
			:description="t('health.summary', {
				tickets: data?.data.tickets ?? 0,
				clienti: data?.data.clienti ?? 0,
				persone: data?.data.persone ?? 0,
			})"
		/>
	</UContainer>
</template>
