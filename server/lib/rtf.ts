const RTF_PREFIX = "{\\rtf";

// destinazioni RTF il cui contenuto non è testo visibile
const SKIPPED_GROUPS = ["fonttbl", "colortbl", "stylesheet", "info", "generator", "pict"];

const RTF_HEADER = [
	"{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil Arial;}}",
	"{\\colortbl ;\\red0\\green0\\blue0;}",
	"\\viewkind4\\uc1\\pard\\cf1\\lang1040\\fs16 ",
].join("\r\n");

export function isRtf(value: string): boolean {
	return value.trimStart().startsWith(RTF_PREFIX);
}

/**
 * Turns a MMEMO blob into readable text. Edison PLUS writes RTF from its editor
 * but plain text through other paths, so both shapes are present in TBATCL and
 * both have to come back the same way.
 */
export function fromRtf(value: string | null | undefined): string {
	const source = value ?? "";

	if (!isRtf(source)) {
		return normalize(source);
	}

	let output = "";
	let index = 0;
	let skipDepth = 0;
	let depth = 0;

	while (index < source.length) {
		const char = source[index];

		if (char === "{") {
			depth += 1;
			index += 1;

			const destination = SKIPPED_GROUPS.find(name =>
				source.startsWith(`\\${name}`, index) || source.startsWith(`\\*\\${name}`, index),
			);

			if (destination && skipDepth === 0) {
				skipDepth = depth;
			}

			continue;
		}

		if (char === "}") {
			if (skipDepth === depth) {
				skipDepth = 0;
			}

			depth -= 1;
			index += 1;
			continue;
		}

		if (char === "\\") {
			const control = /^\\([a-z]+)(-?\d+)? ?/i.exec(source.slice(index));

			if (control) {
				if (skipDepth === 0 && (control[1] === "par" || control[1] === "line")) {
					output += "\n";
				}

				index += control[0].length;
				continue;
			}

			const hex = /^\\'([0-9a-f]{2})/i.exec(source.slice(index));

			if (hex?.[1]) {
				if (skipDepth === 0) {
					output += String.fromCharCode(Number.parseInt(hex[1], 16));
				}

				index += hex[0].length;
				continue;
			}

			// backslash, graffe e simili sono preceduti da \
			if (skipDepth === 0 && source[index + 1]) {
				output += source[index + 1];
			}

			index += 2;
			continue;
		}

		// i ritorni a capo del documento sono formattazione, non contenuto:
		// il testo va a capo solo con \par
		if (char === "\r" || char === "\n") {
			index += 1;
			continue;
		}

		if (skipDepth === 0) {
			output += char;
		}

		index += 1;
	}

	return normalize(output);
}

/** Builds the same RTF document the Edison PLUS editor writes. */
export function toRtf(text: string): string {
	const body = normalize(text)
		.split("\n")
		.map(escape)
		.join("\\par\r\n");

	return `${RTF_HEADER}${body}\\f1 \r\n\\par }\r\n`;
}

/**
 * The plain mirror column. Edison PLUS stores it upper case, so rows written
 * here look the same as the ones already in the table.
 */
export function toPlain(text: string): string {
	return normalize(text).toUpperCase();
}

function escape(text: string): string {
	return text.replace(/[\\{}]/g, match => `\\${match}`)
		.replace(/[\u0080-\uFFFF]/g, match => `\\'${match.charCodeAt(0).toString(16).padStart(2, "0")}`);
}

function normalize(text: string): string {
	return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
