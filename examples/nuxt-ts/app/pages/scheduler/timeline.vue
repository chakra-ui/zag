<script setup lang="ts">
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor, schedulerResourceEvents, schedulerResources } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const service = useMachine(scheduler.machine, {
  id: useId(),
  defaultView: "timeline",
  resources: schedulerResources,
  defaultDate: schedulerAnchor,
  events: schedulerResourceEvents,
})

const api = computed(() => scheduler.connect(service, normalizeProps))
const timeline = computed(() => api.value.getTimelineState())
</script>

<template>
  <main class="scheduler">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPrevTriggerProps()">‹</button>
        <button v-bind="api.getTodayTriggerProps()">Today</button>
        <button v-bind="api.getNextTriggerProps()">›</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
      </div>

      <div v-bind="api.getTimelineProps()">
        <div v-bind="api.getTimelineHeaderProps()">
          <div class="scheduler-timeline-corner" />
          <div class="scheduler-timeline-axis">
            <div
              v-for="slot in timeline.slots"
              :key="slot.start.toString()"
              v-bind="api.getTimelineSlotProps({ slot })"
            >
              {{ slot.label }}
            </div>
          </div>
        </div>

        <div v-for="row in timeline.rows" :key="row.id" v-bind="api.getTimelineRowProps({ row })">
          <div v-bind="api.getTimelineRowHeaderProps({ row })">{{ row.title }}</div>
          <div v-bind="api.getTimelineTrackProps({ row })">
            <div
              v-for="event in api.getEventsForRow(row)"
              :key="event.id"
              v-bind="api.getEventProps({ event, layout: 'timeline' })"
            >
              <span class="scheduler-event-title">{{ event.title }}</span>
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
