import { z } from "zod";

/** Query accepted by the picker endpoints: a page of ten, plus a search term. */
export const lookupQuerySchema = z.object({
	search: z.string().trim().max(60).default(""),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(200).default(10),
});

export type LookupQuery = z.infer<typeof lookupQuerySchema>;

export interface LookupItem {
	code: string;
	name: string;
}
