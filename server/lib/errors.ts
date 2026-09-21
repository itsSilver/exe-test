export type ErrorCode
	= | "BAD_REQUEST"
		| "UNAUTHORIZED"
		| "FORBIDDEN"
		| "NOT_FOUND"
		| "CONFLICT"
		| "INTERNAL_ERROR";

/**
 * Carries a translation key rather than a sentence: the locale is only known
 * per request, so the message is resolved once, by the handler wrapper.
 */
export class ApiError extends Error {
	constructor(
		readonly statusCode: number,
		readonly messageKey: string,
		readonly code: ErrorCode,
	) {
		super(messageKey);
		this.name = "ApiError";
	}
}

export function badRequest(messageKey: string) {
	return new ApiError(400, messageKey, "BAD_REQUEST");
}

export function unauthorized(messageKey = "errors.unauthorized") {
	return new ApiError(401, messageKey, "UNAUTHORIZED");
}

export function forbidden(messageKey = "errors.forbidden") {
	return new ApiError(403, messageKey, "FORBIDDEN");
}

export function notFound(messageKey = "errors.notFound") {
	return new ApiError(404, messageKey, "NOT_FOUND");
}

export function conflict(messageKey: string) {
	return new ApiError(409, messageKey, "CONFLICT");
}

export function internalError(messageKey = "errors.generic") {
	return new ApiError(500, messageKey, "INTERNAL_ERROR");
}
