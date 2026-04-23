<script setup lang="ts">
import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
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
]

const toCalDate = (d: DateValue) => new CalendarDate(d.year, d.month, d.day)
const toCalDateTime = (d: DateValue) => new CalendarDateTime(d.year, d.month, d.day, 0, 0)

const controls = useControls(schedulerControls)
const date = ref<DateValue>(TODAY)
const events = ref<scheduler.SchedulerEvent[]>(INITIAL)

const dpService = useMachine(datePicker.machine, {
  id: useId(),
  inline: true,
  selectionMode: "single",
  get value() {
    return [toCalDate(date.value)]
  },
  get focusedValue() {
    return toCalDate(date.value)
  },
  onValueChange: (d) => {
    if (d.value[0]) date.value = toCalDateTime(d.value[0])
  },
  onFocusChange: (d) => {
    if (d.focusedValue) date.value = toCalDateTime(d.focusedValue)
  },
})

const dp = computed(() => datePicker.connect(dpService, normalizeProps))

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    view: "week",
    get date() {
      return date.value
    },
    get events() {
      return events.value
    },
    onDateChange: (d) => (date.value = d.date),
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler" :style="{ alignSelf: 'stretch', width: '100%' }">
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: '340px minmax(0, 1fr)',
        gap: '16px',
        alignItems: 'start',
        width: '100%',
      }"
    >
      <div
        class="date-picker"
        :style="{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          background: '#fff',
          fontSize: '13px',
        }"
      >
        <div v-bind="dp.getRootProps()">
          <div v-bind="dp.getContentProps()">
            <div
              v-bind="dp.getViewControlProps({ view: 'day' })"
              :style="{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }"
            >
              <button v-bind="dp.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
              <button v-bind="dp.getViewTriggerProps()" :style="{ flex: 1, fontWeight: 600 }">
                {{ dp.visibleRangeText.start }}
              </button>
              <button v-bind="dp.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
            </div>
            <table
              v-bind="dp.getTableProps({ view: 'day' })"
              :style="{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }"
            >
              <thead v-bind="dp.getTableHeaderProps({ view: 'day' })">
                <tr v-bind="dp.getTableRowProps({ view: 'day' })">
                  <th
                    v-for="(d, i) in dp.weekDays"
                    :key="i"
                    scope="col"
                    :aria-label="d.long"
                    :style="{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, padding: '4px' }"
                  >
                    {{ d.narrow }}
                  </th>
                </tr>
              </thead>
              <tbody v-bind="dp.getTableBodyProps({ view: 'day' })">
                <tr v-for="(week, i) in dp.weeks" :key="i" v-bind="dp.getTableRowProps({ view: 'day' })">
                  <td
                    v-for="(value, j) in week"
                    :key="j"
                    v-bind="dp.getDayTableCellProps({ value })"
                    :style="{ padding: '1px', textAlign: 'center' }"
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
          <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
          <button v-bind="api.getTodayTriggerProps()">{{ api.todayTriggerLabel }}</button>
          <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
          <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
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
                <div
                  v-for="event in api.getEventsForDay(d)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                  :style="{ ...api.getEventStyle(event), ['--event-color' as any]: event.color }"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })" class="scheduler-resize-handle">
                    <div class="scheduler-resize-grip" />
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
