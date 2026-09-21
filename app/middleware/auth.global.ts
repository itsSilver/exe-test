const PUBLIC_ROUTES = new Set(["/login"]);

export default defineNuxtRouteMiddleware(async (to) => {
	const auth = useAuthStore();

	if (!auth.isAuthenticated) {
		await auth.fetch();
	}

	if (auth.isAuthenticated && to.path === "/login") {
		return navigateTo("/");
	}

	if (!auth.isAuthenticated && !PUBLIC_ROUTES.has(to.path)) {
		return navigateTo("/login");
	}
});
