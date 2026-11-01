<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAllDayEvents, schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const events = shallowRef(schedulerAllDayEvents)
const dropLog = ref("")
const maxAllDayRows = ref<number | undefined>(undefined)

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    defaultDate: schedulerAnchor,
    maxAllDayRows: maxAllDayRows.value,
    events: events.value,
    onEventDrop(d) {
      // the machine reports the region it landed in; converting the event is the consumer's call
      dropLog.value = `${d.event.id} allDay:${d.allDay} ${d.newStart} → ${d.newEnd} Δ${d.delta.days}d${d.delta.minutes}m`
      events.value = events.value.map((e) =>
        e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd, allDay: d.allDay } : e,
      )
    },
    onEventResize: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <output data-testid="drop-log">{{ dropLog }}</output>
    <label>
      <input
        type="checkbox"
        data-testid="cap-rows"
        :checked="maxAllDayRows === 1"
        @change="maxAllDayRows = ($event.target as HTMLInputElement).checked ? 1 : undefined"
      />
      Cap the all-day row at one level
    </label>
    <div v-bind="api.getRootProps()">
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

      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="date in api.visibleDays" :key="date.toString()" v-bind="api.getColumnHeaderProps({ date })">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(date) }}</span>
            <span class="scheduler-header-day-num">{{ date.day }}</span>
          </div>
        </div>
        <div v-bind="api.getAllDayRowProps()">
          <div v-bind="api.getAllDayLabelProps()">All day</div>
          <!-- a bar overflows to the right, so earlier cells must paint above later ones -->
          <div
            v-for="(date, index) in api.visibleDays"
            :key="`ad-${date.toString()}`"
            v-bind="api.getDayCellProps({ date, allDay: true })"
            :style="{ zIndex: api.visibleDays.length - index }"
          >
            <button
              v-for="entry in api.getAllDayOverflow().filter((entry) => entry.date.compare(date) === 0)"
              key="more"
              v-bind="api.getMoreEventsProps({ date, count: entry.count })"
              class="scheduler-all-day-more"
            >
              +{{ entry.count }} more
            </button>
            <!-- a bar lives in the cell it starts on and overflows across the ones it covers -->
            <div
              v-for="segment in api.getAllDaySegments().filter((segment) => segment.column === index)"
              :key="segment.event.id"
              v-bind="api.getEventProps({ event: segment.event, layout: 'all-day', segment })"
            >
              <div
                v-if="segment.isStart"
                v-bind="api.getEventResizeHandleProps({ event: segment.event, edge: 'start' })"
              />
              <span class="scheduler-event-title">{{ segment.event.title }}</span>
              <div v-if="segment.isEnd" v-bind="api.getEventResizeHandleProps({ event: segment.event, edge: 'end' })" />
            </div>
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
                <div
                  v-for="event in api.getEventsForDay(date).filter((e) => !e.allDay)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                    <div class="scheduler-resize-grip" />
                  </div>
                </div>
                <div v-bind="api.getDragOriginProps({ date })" />
                <div v-bind="api.getDragPreviewProps({ date })">
                  <div class="scheduler-event-title">{{ api.dragState?.event.title }}</div>
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
