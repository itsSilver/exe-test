import { z } from "zod";

// TBATCL.CSTATO: aperto, sospeso, chiuso
export const STATUSES = ["A", "S", "C"] as const;

// TBATCL.CPRIORIT: alta, media, bassa
export const PRIORITIES = ["A", "M", "B"] as const;

/** An activity/ticket once it has left the Firebird layer. */
export const activitySchema = z.object({
	id: z.number().int(),
	customerCode: z.string().max(6),
	customerName: z.string(),
	personCode: z.string().max(6),
	personName: z.string(),
	date: z.iso.date(),
	hours: z.number(),
	workTypeCode: z.string().max(2),
	workTypeName: z.string(),
	status: z.enum(STATUSES),
	priority: z.enum(PRIORITIES),
	referencePerson: z.string().max(25),
	note: z.string(),
});

/** What the insert and edit forms send, and what the API accepts. */
export const activityInputSchema = z.object({
	customerCode: z.string().trim().min(1, "activity.validation.customerRequired").max(6),
	personCode: z.string().trim().min(1, "activity.validation.personRequired").max(6),
	date: z.iso.date("activity.validation.dateRequired"),
	// i minuti arrivano già convertiti in ore decimali
	hours: z.number().positive("activity.validation.hoursPositive"),
	workTypeCode: z.string().trim().max(2),
	status: z.enum(STATUSES, "activity.validation.statusRequired"),
	priority: z.enum(PRIORITIES, "activity.validation.priorityRequired"),
	referencePerson: z.string().trim().max(25),
	note: z.string().trim().min(1, "activity.validation.noteRequired"),
});

export type Activity = z.infer<typeof activitySchema>;
export type ActivityInput = z.infer<typeof activityInputSchema>;
