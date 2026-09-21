import { describe, expect, it } from "vitest";
import { isNetworkError, shouldQueue } from "./offline";

describe("isNetworkError", () => {
	it("treats a failure with no status as a lost connection", () => {
		expect(isNetworkError(new Error("Failed to fetch"))).toBe(true);
	});

	// un 400 o un 409 sono risposte del server, non mancanza di rete
	it.each([400, 401, 409, 500])("does not treat a %i as a lost connection", (statusCode) => {
		expect(isNetworkError({ statusCode })).toBe(false);
	});

	it("reads the status under either name", () => {
		expect(isNetworkError({ status: 422 })).toBe(false);
	});
});

describe("shouldQueue", () => {
	it("queues while the browser reports no connection", () => {
		expect(shouldQueue(false)).toBe(true);
	});

	it("queues when a request never reached the server", () => {
		expect(shouldQueue(true, new Error("Failed to fetch"))).toBe(true);
	});

	it("does not queue a request the server refused", () => {
		expect(shouldQueue(true, { statusCode: 400 })).toBe(false);
	});

	it("does not queue when nothing went wrong", () => {
		expect(shouldQueue(true)).toBe(false);
	});
});
