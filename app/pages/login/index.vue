<script setup lang="ts">
import { loginSchema } from "#shared/schemas/auth";

definePageMeta({
	layout: "auth",
});

const { t } = useI18n();
const auth = useAuthStore();
const notify = useNotify();
const validate = useZodValidator(loginSchema);

const turnstile = ref();
const isLoading = ref(false);

const state = reactive({
	userCode: "",
	password: "",
	turnstileToken: "",
});

async function onSubmit() {
	isLoading.value = true;

	try {
		const response = await auth.login(
			state.userCode,
			state.password,
			state.turnstileToken,
		);

		notify.success(response.message);
		await navigateTo("/");
	}
	catch (error) {
		notify.error(error, "errors.invalidCredentials");

		// il token è monouso: senza reset il secondo tentativo fallirebbe sempre
		turnstile.value?.reset();
		state.turnstileToken = "";
	}
	finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<UCard class="w-full max-w-sm">
		<template #header>
			<h1 class="text-xl font-semibold">
				{{ t("auth.title") }}
			</h1>
			<p class="mt-1 text-sm text-muted">
				{{ t("auth.subtitle") }}
			</p>
		</template>

		<UForm
			:validate="validate"
			:state="state"
			class="space-y-4"
			@submit="onSubmit"
		>
			<UFormField
				:label="t('auth.userCode')"
				name="userCode"
				required
			>
				<UInput
					v-model="state.userCode"
					class="w-full"
					maxlength="2"
					autocomplete="username"
					autocapitalize="characters"
					icon="i-lucide-user"
				/>
			</UFormField>

			<UFormField
				:label="t('auth.password')"
				name="password"
				required
			>
				<UInput
					v-model="state.password"
					class="w-full"
					type="password"
					maxlength="10"
					autocomplete="current-password"
					icon="i-lucide-lock"
				/>
			</UFormField>

			<UFormField name="turnstileToken">
				<NuxtTurnstile
					ref="turnstile"
					v-model="state.turnstileToken"
				/>
			</UFormField>

			<UButton
				type="submit"
				block
				size="lg"
				icon="i-lucide-log-in"
				:loading="isLoading"
				:label="t('auth.submit')"
			/>
		</UForm>
	</UCard>
</template>
