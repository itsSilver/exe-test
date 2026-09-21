import type { Activity, ActivityGroup } from "#shared/schemas/activity";

/**
 * The list is grouped by person. Most rows in TBATCL have no person set, so
 * those form their own group; the label for it belongs to the interface, so
 * an empty code is left as it is.
 */
export function groupByPerson(activities: Activity[]): ActivityGroup[] {
	const groups = new Map<string, ActivityGroup>();

	for (const activity of activities) {
		const existing = groups.get(activity.personCode);

		if (existing) {
			existing.activities.push(activity);
			continue;
		}

		groups.set(activity.personCode, {
			personCode: activity.personCode,
			personName: activity.personName,
			activities: [activity],
		});
	}

	return [...groups.values()];
}
