<script setup lang="ts">
import { startOfWeek } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")
const DAY = WEEK.add({ days: 2 })

const INITIAL: scheduler.SchedulerEvent[] = [
  // freely editable
  { id: "movable", title: "Movable", start: DAY.set({ hour: 9 }), end: DAY.set({ hour: 10 }), color: "#3b82f6" },
  // locked via the `disabled` flag
  { id: "locked", title: "Locked", start: DAY.set({ hour: 11 }), end: DAY.set({ hour: 12 }), disabled: true },
  // draggable but not resizable, decided by the predicates below
  { id: "fixed-length", title: "Fixed length", start: DAY.set({ hour: 14 }), end: DAY.set({ hour: 15 }) },
  // these two overlap, so both report a conflict
  { id: "conflict-a", title: "Conflict A", start: DAY.set({ hour: 16 }), end: DAY.set({ hour: 17 }) },
  { id: "conflict-b", title: "Conflict B", start: DAY.set({ hour: 16, minute: 30 }), end: DAY.set({ hour: 17 }) },
]

const events = shallowRef(INITIAL)

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "day",
    defaultDate: DAY,
    dayStartHour: 8,
    dayEndHour: 19,
    events: events.value,
    canDragEvent: (event) => !event.disabled,
    canResizeEvent: (event) => !event.disabled && event.id !== "fixed-length",
    onEventDrop(details) {
      events.value = events.value.map((e) =>
        e.id === details.event.id ? { ...e, start: details.newStart, end: details.newEnd } : e,
      )
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <ul>
      <li>Movable — drag and resize</li>
      <li>Locked — `disabled`, neither</li>
      <li>Fixed length — drag only, `canResizeEvent` says no</li>
      <li>Conflict A / B — overlap, so `hasConflict` is true for both</li>
    </ul>

    <div v-bind="api.getRootProps()">
      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getColumnHeaderProps(column)">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(column.date) }}</span>
          </div>
        </div>
        <div class="scheduler-time-grid-scroll" tabindex="0" aria-label="Schedule grid">
          <div v-bind="api.getGridProps()">
            <div v-bind="api.getGridRowProps()">
              <div v-bind="api.getTimeGutterProps()">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLabelProps({ hour })">
                  {{ hour.label }}
                </div>
              </div>

              <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getDayColumnProps(column)">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLineProps({ hour })" />
                <div
                  v-for="event in api.getEventsForColumn(column)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                  :data-conflicting="api.hasConflict(event)"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                    <div class="scheduler-resize-grip" />
                  </div>
                </div>
                <div v-bind="api.getDragOriginProps(column)" />
                <div v-bind="api.getDragPreviewProps(column)">
                  <div class="scheduler-event-title">{{ api.dragState?.event.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
