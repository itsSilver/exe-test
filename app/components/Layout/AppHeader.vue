<script setup lang="ts">
const { t } = useI18n();
const auth = useAuthStore();
const notify = useNotify();
const route = useRoute();

const isMenuOpen = ref(false);
const isLoggingOut = ref(false);

const items = computed(() => [
	{
		label: t("menu.activities"),
		icon: "i-lucide-ticket",
		to: "/attivita",
		active: route.path.startsWith("/attivita"),
		onSelect: () => {
			isMenuOpen.value = false;
		},
	},
	{
		label: t("auth.logout"),
		icon: "i-lucide-log-out",
		onSelect: () => {
			isMenuOpen.value = false;
			onLogout();
		},
	},
]);

async function onLogout() {
	isLoggingOut.value = true;

	try {
		const response = await auth.logout();
		notify.success(response.message);
	}
	catch (error) {
		notify.error(error);
	}
	finally {
		isLoggingOut.value = false;
	}
}
</script>

<template>
	<header class="sticky top-0 z-10 border-b border-default bg-default/80 backdrop-blur">
		<UContainer class="flex h-14 items-center gap-2">
			<UButton
				color="neutral"
				variant="ghost"
				icon="i-lucide-menu"
				:aria-label="t('menu.open')"
				:loading="isLoggingOut"
				@click="isMenuOpen = true"
			/>

			<span class="font-semibold">{{ t("app.name") }}</span>

			<div class="ms-auto flex items-center gap-1">
				<PendingBadge />
				<UColorModeButton />
				<LanguageSwitcher />
			</div>
		</UContainer>

		<USlideover
			v-model:open="isMenuOpen"
			side="left"
			:title="t('menu.title')"
			:description="auth.user ? t('auth.loggedInAs', { name: auth.user.name, code: auth.user.code }) : ''"
		>
			<template #body>
				<UNavigationMenu
					orientation="vertical"
					highlight
					:items="items"
				/>
			</template>
		</USlideover>
	</header>
</template>
