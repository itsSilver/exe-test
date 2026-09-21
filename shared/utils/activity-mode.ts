export type ActivityMode = "view" | "edit" | "insert";

export interface ModeCapabilities {
	readonly: boolean;
	canSubmit: boolean;
	canDelete: boolean;
	canEdit: boolean;
	titleKey: string;
}

/**
 * What each mode allows, from the specification: view shows the data read only
 * and is the only place delete is active; edit and insert take input and end
 * with a confirm.
 */
export function modeCapabilities(mode: ActivityMode): ModeCapabilities {
	return {
		readonly: mode === "view",
		canSubmit: mode !== "view",
		canDelete: mode === "view",
		canEdit: mode === "view",
		titleKey: {
			view: "activity.form.viewTitle",
			edit: "activity.form.editTitle",
			insert: "activity.form.insertTitle",
		}[mode],
	};
}
