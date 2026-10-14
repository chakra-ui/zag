<script setup lang="ts">
import { startOfWeek, toCalendarDateTime } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

const BUSINESS_START = 9
const BUSINESS_END = 17

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Movable",
    start: WEEK.add({ days: 2 }).set({ hour: 10, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 11, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Occupied",
    start: WEEK.add({ days: 2 }).set({ hour: 13, minute: 0 }),
    end: WEEK.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    color: "#ef4444",
  },
]

const events = shallowRef(INITIAL)
const log = ref<string[]>([])

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 7,
    dayEndHour: 20,
    events: events.value,
    // reject anything outside business hours or overlapping another event
    canDropEvent({ event, newStart, newEnd }) {
      // DateValue may be a date without a time, so narrow before reading the hour
      const start = toCalendarDateTime(newStart)
      const end = toCalendarDateTime(newEnd)
      if (start.hour < BUSINESS_START || end.hour > BUSINESS_END) return false
      return !events.value.some(
        (other) => other.id !== event.id && newStart.compare(other.end) < 0 && newEnd.compare(other.start) > 0,
      )
    },
    onEventDrop(details) {
      log.value = [...log.value, `drop:${details.event.id}`]
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
    <p>
      Business hours {{ BUSINESS_START }}:00–{{ BUSINESS_END }}:00. Dragging outside them, or onto
      &ldquo;Occupied&rdquo;, marks the event <code>data-invalid</code> and the release is rejected.
    </p>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getColumnHeaderProps(column)">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(column.date) }}</span>
          </div>
        </div>
        <div class="scheduler-time-grid-scroll" tabindex="0" role="group" aria-label="Time grid">
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

    <div data-testid="drop-log">{{ log.join(" ") }}</div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
