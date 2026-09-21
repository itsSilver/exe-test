<script setup lang="ts">
defineProps<{ title: string }>();

const { t } = useI18n();
</script>

<template>
	<div class="mb-4 flex items-center gap-2">
		<UButton
			color="neutral"
			variant="ghost"
			icon="i-lucide-arrow-left"
			:aria-label="t('activity.form.cancel')"
			to="/attivita"
		/>
		<h1 class="text-lg font-semibold">
			{{ title }}
		</h1>
	</div>
</template>
