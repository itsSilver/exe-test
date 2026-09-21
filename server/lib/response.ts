import { type H3Event, setResponseStatus } from "h3";
import type { ApiErrorResponse, ApiPaginatedResponse, ApiResponse, PaginationInput } from "#shared/types/api";
import { ApiError } from "./errors";
import { t } from "./i18n";

/** Wraps a handler result in the standard envelope, with a localized message. */
export function toJson<T>(event: H3Event, data: T, messageKey = "common.success"): ApiResponse<T> {
	return {
		success: true,
		message: t(event, messageKey),
		data,
	};
}

/** Same as `toJson`, plus the pagination block every list endpoint returns. */
export function toJsonPaginated<T>(
	event: H3Event,
	data: T[],
	{ page, limit, total }: PaginationInput,
	messageKey = "common.success",
): ApiPaginatedResponse<T> {
	const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

	return {
		...toJson(event, data, messageKey),
		meta: {
			page,
			limit,
			total,
			totalPages,
			hasPreviousPage: page > 1,
			hasNextPage: page < totalPages,
		},
	};
}

/**
 * The mirror of `toJson` for failures, so a client can read every response the
 * same way instead of branching on the shape.
 */
export function toErrorJson(event: H3Event, cause: unknown): ApiErrorResponse {
	const error = normalize(cause);

	setResponseStatus(event, error.statusCode);

	return {
		success: false,
		message: t(event, error.messageKey),
		code: error.code,
	};
}

function normalize(cause: unknown): ApiError {
	if (cause instanceof ApiError) {
		return cause;
	}

	const statusCode = (cause as { statusCode?: number })?.statusCode;

	if (statusCode === 401) {
		return new ApiError(401, "errors.unauthorized", "UNAUTHORIZED");
	}

	if (statusCode === 404) {
		return new ApiError(404, "errors.notFound", "NOT_FOUND");
	}

	return new ApiError(500, "errors.generic", "INTERNAL_ERROR");
}
