import type { Activity, ActivityInput, ActivityQuery } from "#shared/schemas/activity";
import {
	countFiltered,
	deleteActivity,
	findById,
	findPaged,
	insertActivity,
	updateActivity,
} from "../db/repositories/activities";
import { findCustomerByCode } from "../db/repositories/customers";
import { badRequest, conflict, notFound } from "../lib/errors";

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

export async function create(input: ActivityInput, userCode: string): Promise<Activity> {
	await assertCustomerExists(input.customerCode);

	const id = await insertActivity(input, userCode);

	if (!id) {
		throw badRequest("errors.generic");
	}

	return getById(id);
}

export async function update(id: number, input: ActivityInput, userCode: string): Promise<Activity> {
	// la riga deve esistere, altrimenti l'UPDATE non tocca nulla in silenzio
	const current = await getById(id);

	/*
	 * Edison PLUS users are editing the same rows on the desktop. If the audit
	 * columns moved since this form was opened, someone else saved in the
	 * meantime and overwriting would lose their work.
	 */
	if (input.revision && current.revision && input.revision !== current.revision) {
		throw conflict("errors.activityChanged");
	}

	await assertCustomerExists(input.customerCode);

	const updated = await updateActivity(id, input, userCode);

	if (!updated) {
		throw notFound("errors.activityNotFound");
	}

	return getById(id);
}

export async function remove(id: number): Promise<void> {
	const deleted = await deleteActivity(id);

	if (!deleted) {
		throw notFound("errors.activityNotFound");
	}
}

/** TBATCL has no foreign key, so an unknown customer would be stored happily. */
async function assertCustomerExists(code: string) {
	const customer = await findCustomerByCode(code);

	if (!customer) {
		throw badRequest("errors.customerNotFound");
	}
}
