import { z } from "zod";

// il primo argomento copre anche il campo assente, non solo quello vuoto
export const loginSchema = z.object({
	userCode: z
		.string("auth.validation.userCodeRequired")
		.trim()
		.min(1, "auth.validation.userCodeRequired")
		.max(2, "auth.validation.userCodeLength"),
	password: z
		.string("auth.validation.passwordRequired")
		.min(1, "auth.validation.passwordRequired")
		.max(10, "auth.validation.passwordLength"),
	turnstileToken: z
		.string("auth.validation.captchaRequired")
		.min(1, "auth.validation.captchaRequired"),
});

export const userSchema = z.object({
	code: z.string(),
	name: z.string(),
	role: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
