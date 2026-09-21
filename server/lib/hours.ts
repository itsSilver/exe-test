/** 15 minuti diventano 0,25 ore: centesimi, non sessantesimi. */
export function minutesToHours(minutes: number): number {
	return round(minutes / 60);
}

export function hoursToMinutes(hours: number): number {
	return Math.round(hours * 60);
}

/** NORE is NUMERIC(18,5), so anything longer than that is not worth keeping. */
export function round(hours: number): number {
	return Math.round(hours * 100_000) / 100_000;
}
