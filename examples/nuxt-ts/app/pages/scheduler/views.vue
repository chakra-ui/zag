<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()

const INITIAL_EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 4 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 11, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Lunch",
    start: TODAY.set({ hour: 12, minute: 0 }),
    end: TODAY.set({ hour: 13, minute: 0 }),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "Overlap A",
    start: TODAY.set({ hour: 9, minute: 15 }),
    end: TODAY.set({ hour: 10, minute: 15 }),
    color: "#ef4444",
  },
  {
    id: "5",
    title: "Overlap B",
    start: TODAY.set({ hour: 9, minute: 30 }),
    end: TODAY.set({ hour: 10, minute: 0 }),
    color: "#8b5cf6",
  },
]

const controls = useControls(schedulerControls)
const events = ref<scheduler.SchedulerEvent[]>(INITIAL_EVENTS)

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    get events() {
      return events.value
    },
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
    onEventClick: (d) => console.log("event clicked", d.event.title),
    onSlotSelect: (d) => console.log("slot selected", d),
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))

const viewOptions: scheduler.ViewType[] = ["day", "week", "month"]
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

      <div v-if="api.view === 'month'" class="scheduler-month-grid">
        <div class="scheduler-month-header">
          <div v-for="(d, i) in api.weekDays" :key="i" class="scheduler-header-cell">{{ d.short }}</div>
        </div>
        <div class="scheduler-month-body">
          <div v-for="(week, wi) in api.getMonthGrid(api.date)" :key="wi" class="scheduler-month-week">
            <div
              v-for="cell in week"
              :key="cell.date.toString()"
              v-bind="api.getDayCellProps({ date: cell.date, referenceDate: api.date })"
              class="scheduler-month-cell"
            >
              <div class="scheduler-month-day-number">{{ cell.date.day }}</div>
              <div
                v-for="event in api.getEventsForDay(cell.date).slice(0, 3)"
                :key="event.id"
                v-bind="api.getEventProps({ event })"
                class="scheduler-month-event"
                :style="{ ['--event-color' as any]: event.color ?? '#3b82f6' }"
              >
                {{ String(event.title ?? "") }}
              </div>
              <button
                v-if="api.getEventsForDay(cell.date).length > 3"
                v-bind="api.getMoreEventsProps({ date: cell.date, count: api.getEventsForDay(cell.date).length - 3 })"
                class="scheduler-more-events"
              >
                +{{ api.getEventsForDay(cell.date).length - 3 }} more
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="scheduler-time-grid-wrapper">
        <div class="scheduler-col-headers">
          <div class="scheduler-header-cell scheduler-gutter-header" />
          <div v-for="(d, i) in api.visibleDays" :key="`h-${d.toString()}`" class="scheduler-header-cell">
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
              <div v-bind="api.getCurrentTimeIndicatorProps()" />
              <div
                v-for="event in api.getEventsForDay(d)"
                :key="event.id"
                v-bind="api.getEventProps({ event })"
                :style="{
                  ...api.getEventStyle(event),
                  opacity: api.dragPreview?.eventId === event.id ? 0.25 : 1,
                  ['--event-color' as any]: event.color ?? '#3b82f6',
                }"
              >
                <div class="scheduler-event-title">{{ String(event.title ?? "") }}</div>
                <div class="scheduler-event-time">{{ event.start.toString().slice(11, 16) }}</div>
                <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })" class="scheduler-resize-handle">
                  <div class="scheduler-resize-grip" />
                </div>
              </div>
              <template v-if="api.getDragGhost({ date: d })">
                <div v-bind="api.getDragGhost({ date: d })!.props">
                  <div class="scheduler-event-title">
                    {{ String(api.getDragGhost({ date: d })!.event.title ?? "") }}
                  </div>
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
