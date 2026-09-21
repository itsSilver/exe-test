import type { Activity, ActivityQuery } from "#shared/schemas/activity";
import { countFiltered, findById, findPaged } from "../db/repositories/activities";
import { notFound } from "../lib/errors";

export async function listActivities(query: ActivityQuery) {
	// due query servono davvero: le righe della pagina e il totale filtrato
	const [activities, total] = await Promise.all([
		findPaged(query),
		countFiltered(query),
	]);

	return { activities, total };
}

export async function getById(id: number): Promise<Activity> {
	const activity = await findById(id);

	if (!activity) {
		throw notFound("errors.activityNotFound");
	}

	return activity;
}
