<script setup lang="ts">
import * as timePicker from "@zag-js/time-picker"
import { timePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(timePickerControls)

const [state, send] = useMachine(timePicker.machine({ id: "1" }))

const api = computed(() => timePicker.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="time-picker">
    <div v-bind="api.rootProps">
      <div v-bind="api.controlProps" :style="{ display: 'flex', gap: '10px' }">
        <input v-bind="api.inputProps" />
        <button v-bind="api.triggerProps">🗓</button>
        <button v-bind="api.clearTriggerProps">❌</button>
      </div>

      <Teleport to="body">
        <div v-bind="api.positionerProps">
          <div v-bind="api.contentProps">
            <div v-bind="api.getContentColumnProps({ type: 'hour' })">
              <button v-for="hour in api.getAvailableHours()" v-bind="api.getHourCellProps({ hour })">
                {{ hour }}
              </button>
            </div>
            <div v-bind="api.getContentColumnProps({ type: 'minute' })">
              <button v-for="minute in api.getAvailableMinutes()" v-bind="api.getMinuteCellProps({ minute })">
                {{ minute }}
              </button>
            </div>
            <div v-bind="api.getContentColumnProps({ type: 'second' })">
              <button v-for="second in api.getAvailableSeconds()" v-bind="api.getSecondCellProps({ second })">
                {{ second }}
              </button>
            </div>
            <div v-bind="api.getContentColumnProps({ type: 'period' })">
              <button v-bind="api.getPeriodCellProps({ period: 'am' })">AM</button>
              <button v-bind="api.getPeriodCellProps({ period: 'pm' })">PM</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
