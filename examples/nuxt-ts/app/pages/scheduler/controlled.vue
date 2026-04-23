<script setup lang="ts">
import type { DateValue } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Sprint planning",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 10, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Interview",
    start: TODAY.subtract({ days: 3 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 3 }).set({ hour: 12, minute: 0 }),
    color: "#ef4444",
  },
  {
    id: "3",
    title: "1:1 with manager",
    start: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 14, minute: 30 }),
    color: "#10b981",
  },
]

const controls = useControls(schedulerControls)
const view = ref<scheduler.ViewType>("week")
const date = ref<DateValue>(TODAY)
const events = ref<scheduler.SchedulerEvent[]>(INITIAL)
const selectedTitle = ref<string | null>(null)

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    get view() {
      return view.value
    },
    get date() {
      return date.value
    },
    get events() {
      return events.value
    },
    onViewChange: (d) => (view.value = d.view),
    onDateChange: (d) => (date.value = d.date),
    onEventClick: (d) => (selectedTitle.value = d.event.title),
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))

const viewOptions: scheduler.ViewType[] = ["day", "week"]
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
        <button v-bind="api.getTodayTriggerProps()">{{ api.todayTriggerLabel }}</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
        <div v-bind="api.getViewSelectProps()">
          <button v-for="v in viewOptions" :key="v" v-bind="api.getViewItemProps({ view: v })">{{ v }}</button>
        </div>
      </div>

      <div :style="{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }">
        View: <strong>{{ view }}</strong> · {{ events.length }} events
        <template v-if="selectedTitle">
          · Selected: <strong>{{ selectedTitle }}</strong>
        </template>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div class="scheduler-col-headers">
          <div class="scheduler-header-cell scheduler-gutter-header" />
          <div v-for="(d, i) in api.visibleDays" :key="d.toString()" class="scheduler-header-cell">
            <span class="scheduler-header-day-label">{{ api.weekDays[i % 7].short }}</span>
            <span class="scheduler-header-day-num">{{ d.day }}</span>
          </div>
        </div>

        <div class="scheduler-time-grid-scroll">
          <div v-bind="api.getGridProps()" class="scheduler-time-grid">
            <div v-bind="api.getTimeGutterProps()">
              <div v-for="h in api.hourRange.hours" :key="h.value" :style="h.style" class="scheduler-hour-label">
                {{ h.label }}
              </div>
            </div>

            <div v-for="d in api.visibleDays" :key="d.toString()" v-bind="api.getDayColumnProps({ date: d })">
              <div v-for="h in api.hourRange.hours" :key="h.value" :style="h.style" class="scheduler-hour-line" />
              <div v-for="event in api.getEventsForDay(d)" :key="event.id" v-bind="api.getEventProps({ event })">
                <div class="scheduler-event-title">{{ event.title }}</div>
                <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })" class="scheduler-resize-handle">
                  <div class="scheduler-resize-grip" />
                </div>
              </div>
              <template v-if="api.getDragOrigin({ date: d })">
                <div v-bind="api.getDragOrigin({ date: d })!.props" />
              </template>
              <template v-if="api.getDragGhost({ date: d })">
                <div v-bind="api.getDragGhost({ date: d })!.props">
                  <div class="scheduler-event-title">{{ api.getDragGhost({ date: d })!.event.title }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
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
