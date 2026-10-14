<script setup lang="ts">
import { startOfWeek } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerBacklog } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor
const WEEK = startOfWeek(TODAY, "en-US")

const events = shallowRef<scheduler.SchedulerEvent[]>([])
const backlog = ref(schedulerBacklog)

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "day",
    defaultDate: WEEK.add({ days: 2 }),
    dayStartHour: 8,
    dayEndHour: 18,
    events: events.value,
    onEventReceive(details) {
      const item = backlog.value.find((b) => b.id === details.data)
      if (!item) return
      backlog.value = backlog.value.filter((b) => b.id !== item.id)
      events.value = [
        ...events.value,
        {
          id: item.id,
          title: item.title,
          start: details.start,
          end: details.end,
          allDay: details.allDay,
          color: details.allDay ? "#8b5cf6" : "#3b82f6",
        },
      ]
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <p>Drag an item from the backlog onto the grid.</p>

    <ul class="scheduler-backlog" data-testid="backlog">
      <li v-for="item in backlog" :key="item.id">
        <button
          type="button"
          draggable="true"
          :data-testid="`backlog-${item.id}`"
          @dragstart="(event) => event.dataTransfer?.setData('text/plain', item.id)"
        >
          {{ item.title }}
        </button>
      </li>
    </ul>

    <div v-bind="api.getRootProps()">
      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getColumnHeaderProps(column)">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(column.date) }}</span>
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
              {{ segment.event.title }}
            </div>
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
                  v-for="event in api.getEventsForColumn(column).filter((e) => !e.allDay)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
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
