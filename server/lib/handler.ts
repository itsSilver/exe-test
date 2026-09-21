import { type EventHandlerRequest, type H3Event, defineEventHandler, getQuery, getRouterParam, readBody } from "h3";
import type { ZodType } from "zod";
import { badRequest } from "./errors";
import { toErrorJson } from "./response";

/**
 * Every endpoint is declared with this instead of `defineEventHandler`, so a
 * thrown `ApiError` becomes the same envelope a success returns and no handler
 * has to repeat the try/catch.
 */
export function defineApiHandler<T>(handler: (event: H3Event<EventHandlerRequest>) => Promise<T> | T) {
	return defineEventHandler(async (event) => {
		try {
			return await handler(event);
		}
		catch (cause) {
			if (import.meta.dev) {
				console.error(cause);
			}

			return toErrorJson(event, cause);
		}
	});
}

/** Parses the body against a schema, reporting the first failure as a 400. */
export async function readValidatedBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
	return parse(schema, await readBody(event));
}

/** The same, for the query string. */
export function readValidatedQuery<T>(event: H3Event, schema: ZodType<T>): T {
	return parse(schema, getQuery(event));
}

/** Reads a numeric route parameter, reporting a bad one as a 400. */
export function readValidatedParam(event: H3Event, name: string): number {
	const id = Number(getRouterParam(event, name));

	if (!Number.isInteger(id) || id <= 0) {
		throw badRequest("errors.invalidId");
	}

	return id;
}

function parse<T>(schema: ZodType<T>, input: unknown): T {
	const result = schema.safeParse(input);

	if (!result.success) {
		// i messaggi degli schemi sono chiavi di traduzione, non frasi
		throw badRequest(result.error.issues[0]?.message ?? "errors.generic");
	}

	return result.data;
}
