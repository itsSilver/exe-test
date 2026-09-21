import type { FormError } from "@nuxt/ui";
import type { ZodType } from "zod";

/**
 * The shared Zod schemas carry translation keys as their messages, so the API
 * can localize them per request. UForm renders messages as they are, so client
 * side they go through the translator first.
 */
export function useZodValidator(schema: ZodType) {
	const { t } = useI18n();

	return (state: unknown): FormError[] => {
		const result = schema.safeParse(state);

		if (result.success) {
			return [];
		}

		return result.error.issues.map(issue => ({
			name: issue.path.join("."),
			message: t(issue.message),
		}));
	};
}
