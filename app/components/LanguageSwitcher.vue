<script setup lang="ts">
const { t } = useI18n();
const { locale, options, select } = useLocaleSwitcher();

const items = computed(() =>
	options.value.map(option => ({
		label: option.label,
		type: "checkbox" as const,
		checked: option.value === locale.value,
		onSelect: () => select(option.value),
	})),
);

const current = computed(
	() => options.value.find(option => option.value === locale.value)?.label ?? locale.value,
);
</script>

<template>
	<UDropdownMenu :items="items">
		<UButton
			color="neutral"
			variant="ghost"
			icon="i-lucide-languages"
			:label="current"
			:aria-label="t('common.language')"
		/>
	</UDropdownMenu>
</template>
