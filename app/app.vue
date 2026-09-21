<script setup lang="ts">
const { pageTransition } = usePageTransition();
</script>

<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage :transition="pageTransition" />
		</NuxtLayout>
	</UApp>
</template>
