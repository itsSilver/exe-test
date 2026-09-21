/**
 * Toast helpers for API calls. Both the envelope and the error body already
 * carry a message translated for the request's locale, so they are shown as
 * they arrive and only the fallback needs translating here.
 */
export function useNotify() {
	const toast = useToast();
	const { t } = useI18n();

	function success(message?: string) {
		toast.add({
			title: message || t("common.success"),
			color: "success",
			icon: "i-lucide-circle-check",
		});
	}

	function error(cause: unknown, fallbackKey = "errors.generic") {
		const data = (cause as { data?: { statusMessage?: string; message?: string } })?.data;

		toast.add({
			title: data?.statusMessage || data?.message || t(fallbackKey),
			color: "error",
			icon: "i-lucide-circle-alert",
		});
	}

	return { success, error };
}
