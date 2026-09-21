/** The GG/MM/AA format the specification asks for, from an ISO date. */
export function formatDate(iso: string): string {
	const [year = "", month = "", day = ""] = iso.split("-");

	if (!year || !month || !day) {
		return "";
	}

	return `${day}/${month}/${year.slice(2)}`;
}

/** "GIOVANARDI (000003)", the format the specification gives as an example. */
export function formatCodeLabel(description: string, code: string): string {
	if (!code) {
		return description;
	}

	return description ? `${description} (${code})` : `(${code})`;
}

/** Hours carry decimals, so 0.25 reads as "0,25 h" rather than "0.25". */
export function formatHours(hours: number): string {
	return `${hours.toFixed(2).replace(".", ",")} h`;
}

/** Today, or any Date, as the ISO string the form fields use. */
export function toIsoDate(value: Date): string {
	const month = `${value.getMonth() + 1}`.padStart(2, "0");
	const day = `${value.getDate()}`.padStart(2, "0");

	return `${value.getFullYear()}-${month}-${day}`;
}
