<script setup lang="ts">
import type { DateValue } from "@internationalized/date"
import * as dialog from "@zag-js/dialog"
import * as scheduler from "@zag-js/scheduler"
import { schedulerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const TODAY = scheduler.getToday()
const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const INITIAL: scheduler.SchedulerEvent[] = [
  {
    id: "1",
    title: "Team standup",
    start: TODAY.set({ hour: 9, minute: 0 }),
    end: TODAY.set({ hour: 9, minute: 30 }),
    color: "#3b82f6",
  },
]

const controls = useControls(schedulerControls)
const events = ref<scheduler.SchedulerEvent[]>(INITIAL)
const nextId = ref(INITIAL.length)
const pendingSlot = ref<{ start: DateValue; end: DateValue } | null>(null)
const title = ref("")

const dialogService = useMachine(dialog.machine, { id: useId() })
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))

const service = useMachine(
  scheduler.machine,
  controls.mergeProps<scheduler.Props>({
    id: useId(),
    get events() {
      return events.value
    },
    onEventDragEnd: (d) => (events.value = d.apply(events.value)),
    onEventResizeEnd: (d) => (events.value = d.apply(events.value)),
    onSlotDoubleClick: (d) => {
      pendingSlot.value = { start: d.start, end: d.end }
      title.value = ""
      dialogApi.value.setOpen(true)
    },
  }),
)

const api = computed(() => scheduler.connect(service, normalizeProps))

function commit() {
  const slot = pendingSlot.value
  if (!slot || !title.value.trim()) {
    dialogApi.value.setOpen(false)
    return
  }
  const id = `new-${++nextId.value}`
  events.value = [
    ...events.value,
    { id, title: title.value.trim(), start: slot.start, end: slot.end, color: PALETTE[nextId.value % PALETTE.length] },
  ]
  pendingSlot.value = null
  api.value.clearSelectedSlot()
  dialogApi.value.setOpen(false)
}

function cancel() {
  pendingSlot.value = null
  api.value.clearSelectedSlot()
  dialogApi.value.setOpen(false)
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") commit()
  if (e.key === "Escape") cancel()
}
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
                <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })" class="scheduler-resize-handle">
                  <div class="scheduler-resize-grip" />
                </div>
              </div>
              <template v-if="api.getSelectedSlot({ date: d })">
                <div v-bind="api.getSelectedSlot({ date: d })!.props" />
              </template>
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

    <Teleport to="body" :disabled="!dialogApi.open">
      <template v-if="dialogApi.open">
        <div v-bind="dialogApi.getBackdropProps()" class="scheduler-dialog-backdrop" />
        <div v-bind="dialogApi.getPositionerProps()" class="scheduler-dialog-positioner">
          <div v-bind="dialogApi.getContentProps()" class="scheduler-dialog">
            <h2 v-bind="dialogApi.getTitleProps()">New event</h2>
            <input v-model="title" autofocus type="text" placeholder="Event title" @keydown="onKey" />
            <div class="scheduler-dialog-actions">
              <button type="button" @click="cancel">Cancel</button>
              <button type="button" data-primary @click="commit">Create</button>
            </div>
          </div>
        </div>
      </template>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
