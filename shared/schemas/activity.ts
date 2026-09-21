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
	// versione della riga, dalle colonne di audit di Edison PLUS
	revision: z.string(),
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
	// rimandata indietro in modifica, per accorgersi se qualcun altro ha salvato
	revision: z.string().optional(),
});

export interface ActivityGroup {
	personCode: string;
	personName: string;
	activities: Activity[];
}

export const SORT_FIELDS = ["date", "priority", "status", "customer", "person"] as const;

export type SortField = typeof SORT_FIELDS[number];

/** Query string accepted by the list endpoint. */
export const activityQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	status: z.enum(STATUSES).optional(),
	priority: z.enum(PRIORITIES).optional(),
	search: z.string().trim().max(60).optional(),
	// "-" seleziona le righe senza persona, che sono la maggioranza
	personCode: z.string().trim().max(6).optional(),
	sort: z.enum(SORT_FIELDS).default("date"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export type ActivityQuery = z.infer<typeof activityQuerySchema>;

export const UNASSIGNED = "-";

export type Activity = z.infer<typeof activitySchema>;
export type ActivityInput = z.infer<typeof activityInputSchema>;
