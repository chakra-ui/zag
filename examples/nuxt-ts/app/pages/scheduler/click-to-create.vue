<script setup lang="ts">
import * as popover from "@zag-js/popover"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerControls, schedulerEvents } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-vue-next"
import type { Directive } from "vue"
import "@styles/scheduler.css"
import "@styles/popover.css"

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const vFocus: Directive<HTMLElement> = { mounted: (el) => el.focus() }

const controls = useControls(schedulerControls)
const controlProps = controls.mergeProps<scheduler.Props>({ id: useId() })
const events = shallowRef(schedulerEvents)
let nextId = schedulerEvents.length
const title = ref("")

const popoverService = useMachine(popover.machine, {
  id: useId(),
  positioning: {
    placement: "right-start",
    gutter: 8,
    getAnchorElement: () => api.value.getSelectedSlotEl(),
  },
  onOpenChange: (d) => {
    if (!d.open) {
      api.value.clearSelectedSlot()
      title.value = ""
    }
  },
})
const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))

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
    // Fires on both single click (action: "click") and drag-release (action: "drag")
    onSlotSelect() {
      title.value = ""
      popoverApi.value.setOpen(true)
      popoverApi.value.reposition()
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
const pending = computed(() => api.value.selectedSlot)

function commit() {
  const slot = pending.value
  if (!slot || !title.value.trim()) return
  const id = `new-${++nextId}`
  events.value = [
    ...events.value,
    {
      id,
      title: title.value.trim(),
      start: slot.start,
      end: slot.end,
      color: PALETTE[nextId % PALETTE.length],
    },
  ]
  popoverApi.value.setOpen(false)
}

function handleKey(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault()
    commit()
  }
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
        <span style="margin-inline-start: auto; font-size: 12px; color: #6b7280">
          Click or drag on an empty slot to create an event
        </span>
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
                <div v-bind="api.getSelectedSlotProps({ date })" />
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
          <div v-if="pending" class="scheduler-event-popover-body">
            <div v-bind="popoverApi.getTitleProps()" style="font-size: 13px; font-weight: 600">New event</div>
            <div class="scheduler-event-popover-time">{{ api.formatTimeRange(pending.start, pending.end) }}</div>
            <input
              v-focus
              v-model="title"
              type="text"
              placeholder="Event title"
              style="margin-block-start: 6px; padding: 4px 6px; font-size: 13px; width: 100%"
              @keydown="handleKey"
            />
            <div class="scheduler-event-popover-actions">
              <button type="button" v-bind="popoverApi.getCloseTriggerProps()">
                <XIcon />
              </button>
              <button type="button" data-primary @click="commit">Create</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
