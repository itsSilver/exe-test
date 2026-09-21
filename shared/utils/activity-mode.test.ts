import { describe, expect, it } from "vitest";
import { modeCapabilities } from "./activity-mode";

describe("modeCapabilities", () => {
	it("shows the data read only in view mode", () => {
		expect(modeCapabilities("view")).toMatchObject({ readonly: true, canSubmit: false });
	});

	it.each(["edit", "insert"] as const)("takes input in %s mode", (mode) => {
		expect(modeCapabilities(mode)).toMatchObject({ readonly: false, canSubmit: true });
	});

	// "attivo in sola visualizzazione, non attivo in inserimento e modifica"
	it("only offers delete in view mode", () => {
		expect(modeCapabilities("view").canDelete).toBe(true);
		expect(modeCapabilities("edit").canDelete).toBe(false);
		expect(modeCapabilities("insert").canDelete).toBe(false);
	});

	it("only offers the jump to edit from view mode", () => {
		expect(modeCapabilities("view").canEdit).toBe(true);
		expect(modeCapabilities("edit").canEdit).toBe(false);
	});

	it.each([
		["view", "activity.form.viewTitle"],
		["edit", "activity.form.editTitle"],
		["insert", "activity.form.insertTitle"],
	] as const)("titles %s with %s", (mode, key) => {
		expect(modeCapabilities(mode).titleKey).toBe(key);
	});
});
