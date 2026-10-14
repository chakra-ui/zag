<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import "@styles/scheduler.css"

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props<MeetingPayload>>({ id: useId() })

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

const TODAY = schedulerAnchor

const INITIAL: Event[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 0 }),
    end: TODAY.subtract({ days: 1 }).set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
    payload: { attendees: ["Ada", "Ben", "Cai"], location: "Zoom", meetingUrl: "https://zoom.us/j/123" },
  },
  {
    id: "2",
    title: "Design review",
    start: TODAY.set({ hour: 10, minute: 0 }),
    end: TODAY.set({ hour: 11, minute: 30 }),
    color: "#10b981",
    payload: { attendees: ["Dee", "Eli"], location: "Studio B" },
  },
  {
    id: "3",
    title: "Client sync",
    start: TODAY.add({ days: 2 }).set({ hour: 14, minute: 0 }),
    end: TODAY.add({ days: 2 }).set({ hour: 15, minute: 0 }),
    color: "#f59e0b",
    payload: {
      attendees: ["Finn", "Gwen", "Hana"],
      location: "Google Meet",
      meetingUrl: "https://meet.google.com/xyz",
    },
  },
]

const events = shallowRef<Event[]>(INITIAL)
const selectedId = ref<string | null>(null)

const service = useMachine(
  scheduler.machine as scheduler.Machine<MeetingPayload>,
  computed<scheduler.Props<MeetingPayload>>(() => ({
    ...controlProps.value,
    defaultDate: schedulerAnchor,
    events: events.value,
    onEventDrop: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventResize: (d) => {
      events.value = events.value.map((e) => (e.id === d.event.id ? { ...e, start: d.newStart, end: d.newEnd } : e))
    },
    onEventClick: (d) => {
      selectedId.value = d.event.id
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const selected = computed(() => (selectedId.value ? (api.value.getEventById(selectedId.value) ?? null) : null))
</script>

<template>
  <main class="scheduler scheduler-with-aside">
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
                  <div v-if="event.payload" class="scheduler-event-meta">
                    {{ event.payload.attendees.length }} · {{ event.payload.location }}
                  </div>
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

    <aside class="scheduler-event-panel">
      <template v-if="selected && selected.payload">
        <div class="scheduler-event-panel-title">{{ selected.title }}</div>
        <div class="scheduler-event-panel-time">{{ api.formatTimeRange(selected.start, selected.end) }}</div>
        <div class="scheduler-event-panel-section">
          <div class="scheduler-event-panel-section-label">Attendees</div>
          <div>{{ selected.payload.attendees.join(", ") }}</div>
        </div>
        <div class="scheduler-event-panel-row">
          <span class="scheduler-event-panel-row-label">Location: </span>
          {{ selected.payload.location }}
        </div>
        <a
          v-if="selected.payload.meetingUrl"
          :href="selected.payload.meetingUrl"
          target="_blank"
          rel="noreferrer"
          class="scheduler-event-panel-link"
        >
          Join meeting →
        </a>
      </template>
      <div v-else class="scheduler-event-panel-empty">Click an event to see its typed payload.</div>
    </aside>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
