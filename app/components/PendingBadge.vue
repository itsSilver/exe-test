<script setup lang="ts">
const { t } = useI18n();
const { pending, isFlushing, isOnline, flush } = useOfflineQueue();
</script>

<template>
	<UButton
		v-if="pending.length"
		color="warning"
		variant="subtle"
		size="sm"
		icon="i-lucide-cloud-upload"
		:loading="isFlushing"
		:disabled="!isOnline"
		:label="String(pending.length)"
		:aria-label="t('offline.pending', { count: pending.length })"
		@click="flush()"
	/>
</template>
