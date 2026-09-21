import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth";

const valid = { userCode: "01", password: "123", turnstileToken: "token" };

function firstIssue(input: unknown) {
	const result = loginSchema.safeParse(input);

	if (result.success) {
		throw new Error("expected the input to be rejected");
	}

	return result.error.issues[0];
}

describe("loginSchema", () => {
	it("accepts valid credentials", () => {
		expect(loginSchema.safeParse(valid).success).toBe(true);
	});

	it("trims the user code", () => {
		const result = loginSchema.parse({ ...valid, userCode: " 01 " });

		expect(result.userCode).toBe("01");
	});

	// la password non viene trimmata: gli spazi possono farne parte
	it("keeps the password exactly as typed", () => {
		const result = loginSchema.parse({ ...valid, password: " 123 " });

		expect(result.password).toBe(" 123 ");
	});

	it.each([
		["a missing user code", { ...valid, userCode: undefined }, "auth.validation.userCodeRequired"],
		["an empty user code", { ...valid, userCode: "" }, "auth.validation.userCodeRequired"],
		["a user code over 2 characters", { ...valid, userCode: "abc" }, "auth.validation.userCodeLength"],
		["a missing password", { ...valid, password: undefined }, "auth.validation.passwordRequired"],
		["an empty password", { ...valid, password: "" }, "auth.validation.passwordRequired"],
		["a password over 10 characters", { ...valid, password: "12345678901" }, "auth.validation.passwordLength"],
		["a missing captcha token", { ...valid, turnstileToken: undefined }, "auth.validation.captchaRequired"],
		["an empty captcha token", { ...valid, turnstileToken: "" }, "auth.validation.captchaRequired"],
	])("reports %s with a translation key", (_case, input, expected) => {
		expect(firstIssue(input)?.message).toBe(expected);
	});

	it("never leaks an untranslated Zod default", () => {
		const result = loginSchema.safeParse({});

		expect(result.success).toBe(false);

		if (!result.success) {
			for (const issue of result.error.issues) {
				expect(issue.message).toMatch(/^auth\.validation\./);
			}
		}
	});
});
