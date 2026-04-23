<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Daily standup",
    start: TODAY.subtract({ days: 2 }).set({ hour: 9, minute: 30 }),
    end: TODAY.subtract({ days: 2 }).set({ hour: 10, minute: 0 }),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.subtract({ days: 1 }).set({ hour: 11, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 12, minute: 30 }),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Friday demo",
    start: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 16, minute: 0 }),
    color: "#f59e0b",
  },
]

const controls = useControls(schedulerControls)
const events = ref<scheduler.SchedulerEvent[]>(INITIAL)

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    weekStartDay: 1,
    workWeekDays: [1, 2, 3, 4, 5],
    workWeekOnly: true,
    get events() {
      return events.value
    },
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">{{ api.prevTriggerIcon }}</button>
        <button v-bind="api.getTodayTriggerProps()">{{ api.todayTriggerLabel }}</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.nextTriggerIcon }}</button>
        <span v-bind="api.getHeaderTitleProps()">Work Week · {{ api.visibleRangeText.formatted }}</span>
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
