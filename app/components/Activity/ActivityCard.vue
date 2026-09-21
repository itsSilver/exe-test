<script setup lang="ts">
import type { Activity } from "#shared/schemas/activity";

const props = defineProps<{ activity: Activity }>();

const { t } = useI18n();
const { status, priority } = useStatusMeta();

const statusMeta = computed(() => status(props.activity.status));
const priorityMeta = computed(() => priority(props.activity.priority));
</script>

<template>
	<div class="relative rounded-lg border border-default bg-elevated/50 transition-colors focus-within:ring-1 focus-within:ring-primary active:bg-elevated">
		<!-- tutta la scheda apre la visualizzazione, la matita porta alla modifica -->
		<NuxtLink
			:to="`/attivita/${activity.id}`"
			class="block p-3 pe-12"
		>
			<div class="flex items-start justify-between gap-3">
				<span class="text-sm font-medium">
					{{ formatCodeLabel(activity.customerName, activity.customerCode) }}
				</span>

				<time class="shrink-0 text-xs text-muted tabular-nums">
					{{ formatDate(activity.date) }}
				</time>
			</div>

			<p class="mt-2 line-clamp-2 text-sm text-muted">
				{{ activity.note || t("activity.noNote") }}
			</p>

			<div class="mt-3 flex flex-wrap items-center gap-1.5">
				<UBadge
					size="sm"
					variant="subtle"
					:color="statusMeta.color"
					:label="statusMeta.label"
				/>
				<UBadge
					size="sm"
					variant="outline"
					:color="priorityMeta.color"
					:label="priorityMeta.label"
				/>
				<UBadge
					v-if="activity.workTypeCode"
					size="sm"
					variant="outline"
					color="neutral"
					:label="formatCodeLabel(activity.workTypeName, activity.workTypeCode)"
				/>
				<UBadge
					v-if="activity.hours > 0"
					size="sm"
					variant="outline"
					color="neutral"
					icon="i-lucide-clock"
					:label="formatHours(activity.hours)"
				/>
			</div>
		</NuxtLink>

		<UButton
			class="absolute end-2 top-2"
			color="neutral"
			variant="ghost"
			size="sm"
			icon="i-lucide-pencil"
			:aria-label="t('activity.actions.edit')"
			:to="`/attivita/${activity.id}/modifica`"
		/>
	</div>
</template>
