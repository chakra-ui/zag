<script setup lang="ts">
import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-vue-next"
import type { Directive } from "vue"
import "@styles/scheduler.css"
import "@styles/popover.css"

const vFocus: Directive<HTMLElement> = { mounted: (el) => el.focus() }

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const events = shallowRef(schedulerEvents)
const selectedId = ref<string | null>(null)
let anchorEl: HTMLElement | null = null
const editing = ref(false)
const draftTitle = ref("")

const schedulerService = useMachine(
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
    onEventClick: (d) => {
      anchorEl = api.value.getEventEl(d.event.id)
      selectedId.value = d.event.id
      editing.value = false
      draftTitle.value = d.event.title
      popoverApi.value.setOpen(true)
      popoverApi.value.reposition()
    },
  })),
)

const api = computed(() => scheduler.connect(schedulerService, normalizeProps))

const popoverService = useMachine(popover.machine, {
  id: useId(),
  positioning: {
    placement: "right",
    gutter: 8,
    getAnchorElement: () => anchorEl,
  },
  onOpenChange: (details) => {
    if (!details.open) {
      selectedId.value = null
      editing.value = false
    }
  },
})
const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))

const selectedEvent = computed(() => (selectedId.value ? api.value.getEventById(selectedId.value) : undefined))

function commitRename() {
  if (!selectedId.value) return
  const trimmed = draftTitle.value.trim()
  if (!trimmed) {
    editing.value = false
    return
  }
  events.value = events.value.map((e) => (e.id === selectedId.value ? { ...e, title: trimmed } : e))
  editing.value = false
}

function handleRenameKey(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault()
    commitRename()
  } else if (e.key === "Escape") {
    e.preventDefault()
    editing.value = false
    if (selectedEvent.value) draftTitle.value = selectedEvent.value.title
  }
}

function handleDelete() {
  if (!selectedId.value) return
  events.value = events.value.filter((e) => e.id !== selectedId.value)
  popoverApi.value.setOpen(false)
}
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

    <Teleport to="#teleports">
      <div v-bind="popoverApi.getPositionerProps()">
        <div v-bind="popoverApi.getContentProps()" class="scheduler-event-popover">
          <div
            v-if="selectedEvent"
            class="scheduler-event-popover-body"
            :style="{ '--event-color': selectedEvent.color }"
          >
            <div class="scheduler-event-popover-row">
              <span aria-hidden="true" class="scheduler-event-popover-dot" />
              <input
                v-if="editing"
                v-focus
                v-model="draftTitle"
                class="scheduler-event-popover-title"
                @blur="commitRename"
                @keydown="handleRenameKey"
              />
              <strong v-else class="scheduler-event-popover-title">{{ selectedEvent.title }}</strong>
            </div>
            <div class="scheduler-event-popover-time">
              {{ api.formatTimeRange(selectedEvent.start, selectedEvent.end) }}
            </div>
            <div class="scheduler-event-popover-duration">
              Duration: {{ api.formatDuration(selectedEvent.start, selectedEvent.end) }}
            </div>
            <div class="scheduler-event-popover-actions">
              <button type="button" @click="editing = !editing">{{ editing ? "Done" : "Edit" }}</button>
              <button type="button" @click="handleDelete">Delete</button>
              <button type="button" v-bind="popoverApi.getCloseTriggerProps()" data-close>
                <XIcon />
              </button>
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
