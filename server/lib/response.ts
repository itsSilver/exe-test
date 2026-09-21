import type { H3Event } from "h3";
import type { ApiPaginatedResponse, ApiResponse, PaginationInput } from "#shared/types/api";
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
