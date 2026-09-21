<script setup lang="ts">
const { t } = useI18n();
const auth = useAuthStore();
const notify = useNotify();

const isLoggingOut = ref(false);

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
	<UContainer class="py-12">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl font-semibold">
					{{ t("app.name") }}
				</h1>
				<p
					v-if="auth.user"
					class="mt-1 text-sm text-muted"
				>
					{{ t("auth.loggedInAs", {
						name: auth.user.name,
						code: auth.user.code,
					}) }}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<LanguageSwitcher />

				<UButton
					color="neutral"
					variant="subtle"
					icon="i-lucide-log-out"
					:loading="isLoggingOut"
					:label="t('auth.logout')"
					@click="onLogout"
				/>
			</div>
		</div>
	</UContainer>
</template>
