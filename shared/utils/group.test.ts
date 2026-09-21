import type { Activity } from "#shared/schemas/activity";
import { describe, expect, it } from "vitest";
import { groupByPerson } from "./group";

function activity(overrides: Partial<Activity> = {}): Activity {
	return {
		id: 1,
		customerCode: "000001",
		customerName: "ABC S.P.A.",
		personCode: "000001",
		personName: "BRESOLIN",
		date: "2026-01-16",
		hours: 0.25,
		workTypeCode: "TK",
		workTypeName: "TICKET",
		status: "A",
		priority: "B",
		referencePerson: "",
		note: "nota",
		...overrides,
	};
}

describe("groupByPerson", () => {
	it("returns nothing for an empty list", () => {
		expect(groupByPerson([])).toEqual([]);
	});

	it("puts the activities of one person in a single group", () => {
		const groups = groupByPerson([activity({ id: 1 }), activity({ id: 2 })]);

		expect(groups).toHaveLength(1);
		expect(groups[0]?.activities).toHaveLength(2);
	});

	it("keeps the order the rows arrived in, which is newest first", () => {
		const groups = groupByPerson([
			activity({ id: 1, personCode: "ASTI01", personName: "ASSISTENZA TICKET" }),
			activity({ id: 2, personCode: "000001", personName: "BRESOLIN" }),
			activity({ id: 3, personCode: "ASTI01", personName: "ASSISTENZA TICKET" }),
		]);

		expect(groups.map(group => group.personCode)).toEqual(["ASTI01", "000001"]);
		expect(groups[0]?.activities.map(item => item.id)).toEqual([1, 3]);
	});

	// la maggior parte delle righe in TBATCL non ha una persona assegnata
	it("gathers the rows with no person into their own group", () => {
		const groups = groupByPerson([
			activity({ id: 1, personCode: "", personName: "" }),
			activity({ id: 2, personCode: "000001" }),
			activity({ id: 3, personCode: "", personName: "" }),
		]);

		const unassigned = groups.find(group => group.personCode === "");

		expect(unassigned?.activities).toHaveLength(2);
	});

	it("leaves the label for the unassigned group to the interface", () => {
		const groups = groupByPerson([activity({ personCode: "", personName: "" })]);

		expect(groups[0]?.personName).toBe("");
	});

	it("does not drop an activity", () => {
		const activities = [
			activity({ id: 1, personCode: "A" }),
			activity({ id: 2, personCode: "" }),
			activity({ id: 3, personCode: "B" }),
			activity({ id: 4, personCode: "A" }),
		];

		const total = groupByPerson(activities).reduce(
			(sum, group) => sum + group.activities.length,
			0,
		);

		expect(total).toBe(activities.length);
	});
});
