<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const events = shallowRef(schedulerEvents)

const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    ...controlProps.value,
    defaultDate: schedulerAnchor,
    events: events.value,
    onEventDrop: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventClick(d) {
      console.log("event clicked", d.event.title)
    },
    onSlotSelect(d) {
      console.log("slot selected", d)
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))

const viewTypes: scheduler.ViewType[] = ["day", "week", "month"]

const timedEvents = (date: Parameters<scheduler.Api["getEventsForDay"]>[0]) =>
  api.value.getEventsForDay(date).filter((e) => !e.allDay)
</script>

<template>
  <main class="scheduler">
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
        <div v-bind="api.getViewSelectProps()">
          <button v-for="v in viewTypes" :key="v" v-bind="api.getViewItemProps({ view: v })">
            {{ api.getViewText(v) }}
          </button>
        </div>
      </div>

      <div v-if="api.view === 'month'" class="scheduler-month-grid">
        <div class="scheduler-month-header">
          <div v-for="(day, i) in api.getWeekDays()" :key="i" class="scheduler-month-weekday">
            {{ day.short }}
          </div>
        </div>
        <div class="scheduler-month-body">
          <!-- segments are asked for one row at a time, so a bar clips at the week edge -->
          <div v-for="(week, weekIndex) in api.getMonthGrid(api.date)" :key="weekIndex" class="scheduler-month-week">
            <div
              v-for="(date, dayIndex) in week"
              :key="date.toString()"
              v-bind="api.getDayCellProps({ date, referenceDate: api.date })"
              class="scheduler-month-cell"
              :style="{ zIndex: week.length - dayIndex }"
            >
              <div class="scheduler-month-day-number">{{ date.day }}</div>
              <div
                v-for="segment in api.getAllDaySegments(week).filter((segment) => segment.column === dayIndex)"
                :key="segment.event.id"
                v-bind="api.getEventProps({ event: segment.event, layout: 'all-day', segment })"
                class="scheduler-month-bar"
              >
                {{ segment.event.title }}
              </div>
              <div
                v-for="event in timedEvents(date).slice(0, 2)"
                :key="event.id"
                v-bind="api.getEventProps({ event, layout: 'list' })"
                class="scheduler-month-event"
              >
                {{ event.title }}
              </div>
              <button
                v-if="timedEvents(date).length > 2"
                v-bind="api.getMoreEventsProps({ date, count: timedEvents(date).length - 2 })"
              >
                +{{ timedEvents(date).length - 2 }} more
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div
            v-for="date in api.visibleDays"
            :key="`h-${date.toString()}`"
            v-bind="api.getColumnHeaderProps({ date })"
          >
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(date) }}</span>
            <span class="scheduler-header-day-num">{{ date.day }}</span>
          </div>
        </div>
        <div v-bind="api.getAllDayRowProps()">
          <div v-bind="api.getAllDayLabelProps()">All day</div>
          <div
            v-for="(date, index) in api.visibleDays"
            :key="`ad-${date.toString()}`"
            v-bind="api.getDayCellProps({ date, allDay: true })"
            :style="{ zIndex: api.visibleDays.length - index }"
          >
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

                <div v-for="event in timedEvents(date)" :key="event.id" v-bind="api.getEventProps({ event })">
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div class="scheduler-event-time">{{ event.start.toString().slice(11, 16) }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                    <div class="scheduler-resize-grip" />
                  </div>
                </div>

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
