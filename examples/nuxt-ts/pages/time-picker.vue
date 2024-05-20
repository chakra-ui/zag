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
            <div v-bind="api.getColumnProps({ unit: 'hour' })">
              <button v-for="item in api.getHours()" v-bind="api.getHourCellProps({ value: item.value })">
                {{ item.label }}
              </button>
            </div>
            <div v-bind="api.getColumnProps({ unit: 'minute' })">
              <button v-for="item in api.getMinutes()" v-bind="api.getMinuteCellProps({ value: item.value })">
                {{ item.label }}
              </button>
            </div>
            <div v-bind="api.getColumnProps({ unit: 'second' })">
              <button v-for="item in api.getSeconds()" v-bind="api.getSecondCellProps({ value: item.value })">
                {{ item.label }}
              </button>
            </div>
            <div v-bind="api.getColumnProps({ unit: 'period' })">
              <button v-bind="api.getPeriodCellProps({ value: 'am' })">AM</button>
              <button v-bind="api.getPeriodCellProps({ value: 'pm' })">PM</button>
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
