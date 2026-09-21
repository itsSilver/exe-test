/**
 * The driver hands back DDATATTI as a local-time Date. Formatting it through
 * UTC would move every date back a day for anyone east of Greenwich, so all
 * of these use the local-time getters.
 */
export function toIsoDate(value: Date | null | undefined): string {
	if (!value) {
		return "";
	}

	const year = value.getFullYear();
	const month = `${value.getMonth() + 1}`.padStart(2, "0");
	const day = `${value.getDate()}`.padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/** Builds the local midnight Date that TBATCL stores for a given day. */
export function fromIsoDate(value: string): Date {
	const [year, month, day] = value.split("-").map(Number);

	if (!year || !month || !day) {
		throw new Error(`Invalid date: ${value}`);
	}

	return new Date(year, month - 1, day);
}
