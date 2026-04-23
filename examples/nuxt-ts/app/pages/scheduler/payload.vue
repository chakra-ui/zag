<script setup lang="ts">
import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

interface MeetingPayload {
  attendees: string[]
  location: string
  meetingUrl?: string
}

type Event = scheduler.SchedulerEvent<MeetingPayload>

const TODAY = scheduler.getToday()

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

const controls = useControls(schedulerControls)
const events = ref<Event[]>(INITIAL)
const selectedId = ref<string | null>(null)
const anchorEl = ref<HTMLElement | null>(null)

const schedulerService = useMachine(
  scheduler.machine as scheduler.Machine<MeetingPayload>,
  controls.mergeProps<scheduler.Props<MeetingPayload>>({
    id: useId(),
    get events() {
      return events.value
    },
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
    onEventClick: (d) => {
      const el = document.getElementById(`scheduler:${schedulerService.scope.id}:event:${d.event.id}`)
      anchorEl.value = el
      selectedId.value = d.event.id
      popoverApi.value.setOpen(true)
      popoverApi.value.reposition()
    },
  }),
)

const api = computed(() => scheduler.connect(schedulerService, normalizeProps))

const popoverService = useMachine(popover.machine, {
  id: useId(),
  positioning: {
    placement: "right",
    gutter: 8,
    getAnchorRect: () => {
      const el = anchorEl.value
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height }
    },
  },
  onOpenChange: (details) => {
    if (!details.open) selectedId.value = null
  },
})
const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))

const selected = computed<Event | null>(() =>
  selectedId.value ? ((api.value.getEventById(selectedId.value) as Event) ?? null) : null,
)
</script>

<template>
  <main class="scheduler">
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
              <div v-for="event in api.getEventsForDay(d)" :key="event.id" v-bind="api.getEventProps({ event })">
                <div class="scheduler-event-title">{{ event.title }}</div>
                <div v-if="event.payload" class="scheduler-event-meta">
                  {{ event.payload.attendees.length }} · {{ event.payload.location }}
                </div>
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

    <Teleport to="body">
      <div v-bind="popoverApi.getPositionerProps()">
        <div v-bind="popoverApi.getContentProps()" class="scheduler-event-popover">
          <div
            v-if="selected && selected.payload"
            class="scheduler-event-popover-body"
            :style="{ ['--event-color' as any]: selected.color }"
          >
            <div class="scheduler-event-popover-row">
              <span aria-hidden class="scheduler-event-popover-dot" />
              <strong class="scheduler-event-popover-title">{{ selected.title }}</strong>
            </div>
            <div class="scheduler-event-popover-time">
              {{ api.formatTimeRange(selected.start, selected.end) }} ·
              {{ api.formatDuration(selected.start, selected.end) }}
            </div>
            <div class="scheduler-event-popover-meta">
              <div>
                <span class="scheduler-event-popover-label">Attendees</span>
                <div>{{ selected.payload.attendees.join(", ") }}</div>
              </div>
              <div>
                <span class="scheduler-event-popover-label">Location</span>
                <div>{{ selected.payload.location }}</div>
              </div>
              <a
                v-if="selected.payload.meetingUrl"
                :href="selected.payload.meetingUrl"
                target="_blank"
                rel="noreferrer"
                class="scheduler-event-popover-link"
              >
                Join meeting →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="schedulerService" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
