import type { H3Event } from "h3";
import { describe, expect, it } from "vitest";
import { toJson, toJsonPaginated } from "./response";

const event = { node: { req: { headers: {} } } } as unknown as H3Event;

describe("toJson", () => {
	it("wraps the payload with a localized default message", () => {
		expect(toJson(event, { id: 1 })).toEqual({
			success: true,
			message: "Operazione completata",
			data: { id: 1 },
		});
	});

	it("uses the message key it is given", () => {
		expect(toJson(event, null, "auth.loginSuccess").message).toBe("Accesso effettuato");
	});
});

describe("toJsonPaginated", () => {
	it("describes the first page of several", () => {
		const response = toJsonPaginated(event, ["a"], { page: 1, limit: 20, total: 146 });

		expect(response.meta).toEqual({
			page: 1,
			limit: 20,
			total: 146,
			totalPages: 8,
			hasPreviousPage: false,
			hasNextPage: true,
		});
	});

	it("marks the last page as having no next page", () => {
		const response = toJsonPaginated(event, [], { page: 8, limit: 20, total: 146 });

		expect(response.meta.hasPreviousPage).toBe(true);
		expect(response.meta.hasNextPage).toBe(false);
	});

	it("handles a total that divides exactly", () => {
		const response = toJsonPaginated(event, [], { page: 5, limit: 20, total: 100 });

		expect(response.meta.totalPages).toBe(5);
		expect(response.meta.hasNextPage).toBe(false);
	});

	it("reports no pages when there are no rows", () => {
		const response = toJsonPaginated(event, [], { page: 1, limit: 20, total: 0 });

		expect(response.meta.totalPages).toBe(0);
		expect(response.meta.hasPreviousPage).toBe(false);
		expect(response.meta.hasNextPage).toBe(false);
	});

	it("keeps the envelope alongside the pagination block", () => {
		const response = toJsonPaginated(event, ["a", "b"], { page: 1, limit: 2, total: 2 });

		expect(response.success).toBe(true);
		expect(response.data).toEqual(["a", "b"]);
	});
});
