<script setup lang="ts">
import { startOfWeek, toCalendarDate } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const ZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Tokyo"]

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

const EVENTS: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Global standup",
    start: WEEK.add({ days: 2 }).set({ hour: 9 }),
    end: WEEK.add({ days: 2 }).set({ hour: 10 }),
    color: "#3b82f6",
  },
]

const timeZone = ref("UTC")

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    timeZone: timeZone.value,
    events: EVENTS,
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <p>
      Event times are zoneless wall-clock values, so they read the same in every zone. What
      <code>timeZone</code> decides is which day counts as today.
    </p>

    <p>
      Today in this zone: <span data-testid="today">{{ toCalendarDate(api.today).toString() }}</span>
    </p>

    <label>
      Time zone
      <select v-model="timeZone" data-testid="zone">
        <option v-for="zone in ZONES" :key="zone" :value="zone">{{ zone }}</option>
      </select>
    </label>

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
        <div class="scheduler-time-grid-scroll" tabindex="0" aria-label="Schedule grid">
          <div v-bind="api.getGridProps()">
            <div v-bind="api.getGridRowProps()">
              <div v-bind="api.getTimeGutterProps()">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLabelProps({ hour })">
                  {{ hour.label }}
                </div>
              </div>

              <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getDayColumnProps(column)">
                <div
                  v-for="event in api.getEventsForColumn(column)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <span :data-testid="`time-${event.id}`">{{ api.formatTimeRange(event.start, event.end) }}</span>
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
