<script setup lang="ts">
const { t } = useI18n();
const isOnline = useOnline();
</script>

<template>
	<UAlert
		v-if="!isOnline"
		class="rounded-none"
		color="warning"
		variant="subtle"
		icon="i-lucide-wifi-off"
		:title="t('offline.title')"
		:description="t('offline.description')"
	/>
</template>
