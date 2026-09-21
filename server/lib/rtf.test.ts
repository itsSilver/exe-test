import { describe, expect, it } from "vitest";
import { fromRtf, isRtf, toPlain, toRtf } from "./rtf";

// documenti presi da TBATCL, non inventati
const REAL_RTF = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil Arial;}}\r\n{\\colortbl ;\\red0\\green0\\blue0;}\r\n\\viewkind4\\uc1\\pard\\cf1\\lang1040\\fs16 visita medica\\f1 \r\n\\par }\r\n";
const REAL_PLAIN = "Inventario in magazzino\r\n";

describe("isRtf", () => {
	it("recognises a document written by the Edison PLUS editor", () => {
		expect(isRtf(REAL_RTF)).toBe(true);
	});

	it("does not mistake plain text for RTF", () => {
		expect(isRtf(REAL_PLAIN)).toBe(false);
		expect(isRtf("")).toBe(false);
	});
});

describe("fromRtf", () => {
	it("extracts the text from a real TBATCL document", () => {
		expect(fromRtf(REAL_RTF)).toBe("visita medica");
	});

	it("passes plain memos through, since the table holds both shapes", () => {
		expect(fromRtf(REAL_PLAIN)).toBe("Inventario in magazzino");
	});

	it("drops the font and colour tables rather than printing them", () => {
		const text = fromRtf(REAL_RTF);

		expect(text).not.toContain("Arial");
		expect(text).not.toContain("red0");
	});

	it("turns paragraph breaks into new lines", () => {
		const document = `{\\rtf1\\ansi prima\\par seconda\\par }`;

		expect(fromRtf(document)).toBe("prima\nseconda");
	});

	it("decodes accented characters written as hex escapes", () => {
		const document = `{\\rtf1\\ansi attivit\\'e0 registrata}`;

		expect(fromRtf(document)).toBe("attività registrata");
	});

	it("unescapes braces and backslashes", () => {
		const document = `{\\rtf1\\ansi costo \\{100\\} o 50\\\\50}`;

		expect(fromRtf(document)).toBe("costo {100} o 50\\50");
	});

	it("handles null and undefined", () => {
		expect(fromRtf(null)).toBe("");
		expect(fromRtf(undefined)).toBe("");
	});
});

describe("toRtf", () => {
	it("produces a document the reader understands again", () => {
		expect(fromRtf(toRtf("visita medica"))).toBe("visita medica");
	});

	it("keeps the header Edison PLUS writes", () => {
		expect(toRtf("x")).toContain("{\\rtf1\\ansi\\deff0{\\fonttbl");
		expect(toRtf("x")).toContain("{\\colortbl ;\\red0\\green0\\blue0;}");
	});

	it("survives a round trip with several lines", () => {
		expect(fromRtf(toRtf("prima\nseconda\nterza"))).toBe("prima\nseconda\nterza");
	});

	it("survives a round trip with accents and braces", () => {
		const text = "attività {urgente} 50\\50 perché";

		expect(fromRtf(toRtf(text))).toBe(text);
	});

	it("escapes the characters that would otherwise break the document", () => {
		expect(toRtf("{}\\")).toContain("\\{\\}\\\\");
	});
});

describe("toPlain", () => {
	it("mirrors the memo the way the existing rows store it", () => {
		expect(toPlain("Inventario in magazzino")).toBe("INVENTARIO IN MAGAZZINO");
	});

	it("normalises the line endings and trims", () => {
		expect(toPlain("  prima\r\nseconda  ")).toBe("PRIMA\nSECONDA");
	});
});
