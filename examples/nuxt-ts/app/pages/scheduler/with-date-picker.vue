<script setup lang="ts">
import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"
import "@styles/date-picker.css"

const toCalDate = (d: DateValue) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const date = shallowRef<CalendarDateTime>(schedulerAnchor)
const events = shallowRef(schedulerEvents)

const dpId = useId()
const dpService = useMachine(
  datePicker.machine,
  computed<datePicker.Props>(() => ({
    id: dpId,
    inline: true,
    selectionMode: "single",
    value: [toCalDate(date.value)],
    focusedValue: toCalDate(date.value),
    onValueChange: (d) => {
      if (d.value[0]) date.value = toCalDateTime(d.value[0])
    },
    onFocusChange: (d) => {
      if (d.focusedValue) date.value = toCalDateTime(d.focusedValue)
    },
  })),
)

const dp = computed(() => datePicker.connect(dpService, normalizeProps))

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    view: "week",
    ...controlProps.value,
    date: date.value,
    defaultDate: schedulerAnchor,
    events: events.value,
    onDateChange: (d) => {
      date.value = d.date as CalendarDateTime
    },
    onEventDrop: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler" style="align-self: stretch; width: 100%">
    <div style="display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 16px; align-items: start; width: 100%">
      <div
        class="date-picker"
        style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; font-size: 13px"
      >
        <div v-bind="dp.getRootProps()">
          <div v-bind="dp.getContentProps()">
            <div
              v-bind="dp.getViewControlProps({ view: 'day' })"
              style="display: flex; gap: 6px; margin-bottom: 10px; align-items: center"
            >
              <button v-bind="dp.getPrevTriggerProps()">
                <ChevronLeft />
              </button>
              <button v-bind="dp.getViewTriggerProps()" style="flex: 1; font-weight: 600">
                {{ dp.visibleRangeText.start }}
              </button>
              <button v-bind="dp.getNextTriggerProps()">
                <ChevronRight />
              </button>
            </div>
            <table
              v-bind="dp.getTableProps({ view: 'day' })"
              style="width: 100%; border-collapse: collapse; table-layout: fixed"
            >
              <thead v-bind="dp.getTableHeaderProps({ view: 'day' })">
                <tr v-bind="dp.getTableRowProps({ view: 'day' })">
                  <th
                    v-for="(day, i) in dp.weekDays"
                    :key="i"
                    scope="col"
                    :aria-label="day.long"
                    style="font-size: 11px; color: #9ca3af; font-weight: 500; padding: 4px"
                  >
                    {{ day.narrow }}
                  </th>
                </tr>
              </thead>
              <tbody v-bind="dp.getTableBodyProps({ view: 'day' })">
                <tr v-for="(week, i) in dp.weeks" :key="i" v-bind="dp.getTableRowProps({ view: 'day' })">
                  <td
                    v-for="(value, j) in week"
                    :key="j"
                    v-bind="dp.getDayTableCellProps({ value })"
                    style="padding: 1px; text-align: center"
                  >
                    <div v-bind="dp.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-bind="api.getRootProps()">
        <div v-bind="api.getHeaderProps()">
          <button v-bind="api.getPrevTriggerProps()">
            <ChevronLeft />
          </button>
          <button v-bind="api.getTodayTriggerProps()">Today</button>
          <button v-bind="api.getNextTriggerProps()">
            <ChevronRight />
          </button>
          <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
        </div>

        <div class="scheduler-time-grid-wrapper">
          <div v-bind="api.getColumnHeadersProps()">
            <div class="scheduler-gutter-header" />
            <div v-for="date in api.visibleDays" :key="date.toString()" v-bind="api.getColumnHeaderProps({ date })">
              <span class="scheduler-header-day-label">{{ api.formatWeekDay(date) }}</span>
              <span class="scheduler-header-day-num">{{ date.day }}</span>
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

                <div v-for="date in api.visibleDays" :key="date.toString()" v-bind="api.getDayColumnProps({ date })">
                  <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLineProps({ hour })" />
                  <div v-bind="api.getCurrentTimeIndicatorProps({ date })" />
                  <div v-for="event in api.getEventsForDay(date)" :key="event.id" v-bind="api.getEventProps({ event })">
                    <div class="scheduler-event-title">{{ event.title }}</div>
                    <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                      <div class="scheduler-resize-grip" />
                    </div>
                  </div>
                </div>
              </div>
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
