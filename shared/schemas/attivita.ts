import { z } from "zod";

export const STATI = {
	A: "Aperto",
	S: "Sospeso",
	C: "Chiuso",
} as const;

export const PRIORITA = {
	A: "Alta",
	M: "Media",
	B: "Bassa",
} as const;

/** Shape of an activity/ticket once it has left the Firebird layer. */
export const attivitaSchema = z.object({
	id: z.number().int(),
	codiceCliente: z.string().max(6),
	descrizioneCliente: z.string(),
	codicePersona: z.string().max(6),
	descrizionePersona: z.string(),
	data: z.iso.date(),
	ore: z.number(),
	codiceLavorazione: z.string().max(2),
	descrizioneLavorazione: z.string(),
	stato: z.enum(["A", "S", "C"]),
	priorita: z.enum(["A", "M", "B"]),
	personaRiferimento: z.string().max(25),
	nota: z.string(),
});

/** What the insert and edit forms send, and what the API accepts. */
export const attivitaInputSchema = z.object({
	codiceCliente: z.string().trim().min(1, "Il cliente è obbligatorio").max(6),
	codicePersona: z.string().trim().min(1, "La persona è obbligatoria").max(6),
	data: z.iso.date("La data è obbligatoria"),
	// Minutes are converted to decimal hours before they get here.
	ore: z.number().positive("Le ore devono essere maggiori di zero"),
	codiceLavorazione: z.string().trim().max(2),
	stato: z.enum(["A", "S", "C"], "Lo stato è obbligatorio"),
	priorita: z.enum(["A", "M", "B"], "La priorità è obbligatoria"),
	personaRiferimento: z.string().trim().max(25),
	nota: z.string().trim().min(1, "La nota è obbligatoria"),
});

export type Attivita = z.infer<typeof attivitaSchema>;
export type AttivitaInput = z.infer<typeof attivitaInputSchema>;
