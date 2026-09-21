<script setup lang="ts">
import type { ActivityGroup } from "#shared/schemas/activity";

defineProps<{ group: ActivityGroup }>();

const { t } = useI18n();
</script>

<template>
	<section>
		<h2 class="sticky top-14 z-[5] flex items-center gap-2 bg-default/90 py-2 backdrop-blur">
			<UIcon
				name="i-lucide-user-round"
				class="size-4 text-dimmed"
			/>
			<span class="text-sm font-semibold">
				<!-- la persona è spesso vuota in TBATCL: quelle righe finiscono qui -->
				{{ group.personCode
					? formatCodeLabel(group.personName, group.personCode)
					: t("activity.unassigned") }}
			</span>
			<UBadge
				size="sm"
				color="neutral"
				variant="subtle"
				:label="String(group.activities.length)"
			/>
		</h2>

		<div class="flex flex-col gap-2">
			<ActivityCard
				v-for="activity in group.activities"
				:key="activity.id"
				class="activity-card"
				:activity="activity"
			/>
		</div>
	</section>
</template>
