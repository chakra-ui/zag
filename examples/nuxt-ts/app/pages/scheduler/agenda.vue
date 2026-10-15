<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    view: "agenda",
    defaultDate: schedulerAnchor,
    events: schedulerEvents,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const groups = computed(() => api.value.getAgendaGroups())
</script>

<template>
  <main class="scheduler">
    <div v-bind="mergeProps(api.getRootProps(), { style: { maxWidth: '520px' } })">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPreviousTriggerProps()">
          <ChevronLeft />
        </button>
        <button v-bind="api.getTodayTriggerProps()">Today</button>
        <button v-bind="api.getNextTriggerProps()">
          <ChevronRight />
        </button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
      </div>

      <div class="scheduler-mobile-agenda">
        <div v-if="groups.length === 0" class="scheduler-mobile-agenda-empty">
          No events between {{ api.formatLongDate(api.visibleRange.start) }} and
          {{ api.formatLongDate(api.visibleRange.end) }}
        </div>
        <template v-else>
          <div
            v-for="group in groups"
            :key="group.date.toString()"
            v-bind="api.getAgendaGroupProps({ date: group.date })"
          >
            <div v-bind="api.getAgendaGroupTitleProps({ date: group.date })">{{ api.formatLongDate(group.date) }}</div>
            <div v-for="event in group.events" :key="event.id" v-bind="api.getEventProps({ event, layout: 'list' })">
              <div class="scheduler-mobile-agenda-time">{{ api.formatTimeRange(event.start, event.end) }}</div>
              <div class="scheduler-event-title">{{ event.title }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
