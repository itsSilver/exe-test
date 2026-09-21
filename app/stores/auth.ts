import { defineStore } from "pinia";
import type { User } from "#shared/schemas/auth";
import type { ApiResponse } from "#shared/types/api";

export const useAuthStore = defineStore("auth", () => {
	const user = shallowRef<User | null>(null);

	const isAuthenticated = computed(() => user.value !== null);

	/** Reads the session cookie server-side so a refresh keeps the user. */
	async function fetch() {
		try {
			const response = await $fetch<ApiResponse<User>>("/api/auth/me", {
				headers: useRequestHeaders(["cookie"]),
			});

			user.value = response.data;
		}
		catch {
			user.value = null;
		}

		return user.value;
	}

	async function login(userCode: string, password: string, turnstileToken: string) {
		const response = await $fetch<ApiResponse<User>>("/api/auth/login", {
			method: "POST",
			body: { userCode, password, turnstileToken },
		});

		user.value = response.data;

		return response;
	}

	async function logout() {
		const response = await $fetch<ApiResponse<null>>("/api/auth/logout", {
			method: "POST",
		});

		user.value = null;
		await navigateTo("/login");

		return response;
	}

	return { user, isAuthenticated, fetch, login, logout };
});
