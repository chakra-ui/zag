<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const events = shallowRef(schedulerResourceEvents)
const log = ref<string[]>([])

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "day",
    dayStartHour: 8,
    dayEndHour: 18,
    resources: schedulerResources,
    groupBy: "resource",
    defaultDate: schedulerAnchor,
    events: events.value,
    onEventDrop(details) {
      log.value = [...log.value, `drop:${details.event.id}:${details.resource?.id ?? "none"}`]
      events.value = events.value.map((e) =>
        e.id === details.event.id
          ? { ...e, start: details.newStart, end: details.newEnd, resourceId: details.resource?.id ?? e.resourceId }
          : e,
      )
    },
    onSlotSelect(details) {
      log.value = [...log.value, `slot:${details.resource?.id ?? "none"}`]
    },
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div
            v-for="column in api.columns"
            :key="`${column.date}:${column.resource?.id}`"
            v-bind="api.getColumnHeaderProps(column)"
          >
            <span class="scheduler-header-day-label">{{ column.resource?.title }}</span>
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

              <div
                v-for="column in api.columns"
                :key="`${column.date}:${column.resource?.id}`"
                v-bind="api.getDayColumnProps(column)"
              >
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLineProps({ hour })" />
                <div
                  v-for="event in api.getEventsForColumn(column)"
                  :key="event.id"
                  v-bind="api.getEventProps({ event })"
                >
                  <div class="scheduler-event-title">{{ event.title }}</div>
                  <div v-bind="api.getEventResizeHandleProps({ event, edge: 'end' })">
                    <div class="scheduler-resize-grip" />
                  </div>
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

    <div data-testid="drop-log">{{ log.join(" ") }}</div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
