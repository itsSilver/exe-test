import type { Activity } from "#shared/schemas/activity";

type Color = "success" | "warning" | "neutral" | "error" | "info";

const STATUS_COLORS: Record<Activity["status"], Color> = {
	A: "success",
	S: "warning",
	C: "neutral",
};

const PRIORITY_COLORS: Record<Activity["priority"], Color> = {
	A: "error",
	M: "warning",
	B: "neutral",
};

/** Labels and colours for the CSTATO and CPRIORIT codes. */
export function useStatusMeta() {
	const { t } = useI18n();

	function status(code: Activity["status"]) {
		return { label: t(`activity.status.${code}`), color: STATUS_COLORS[code] };
	}

	function priority(code: Activity["priority"]) {
		return { label: t(`activity.priority.${code}`), color: PRIORITY_COLORS[code] };
	}

	return { status, priority };
}
