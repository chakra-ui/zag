<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  open: false,
  defaultOpen: true,
})

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main class="date-picker">
    <div v-bind="api.getControlProps()">
      <input v-bind="api.getInputProps()" />
      <button v-bind="api.getTriggerProps()">🗓</button>
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <table v-bind="api.getTableProps({ view: 'day' })">
          <tbody v-bind="api.getTableBodyProps({ view: 'day' })">
            <tr v-for="(week, i) in api.weeks" :key="i" v-bind="api.getTableRowProps({ view: 'day' })">
              <td v-for="(value, j) in week" :key="j" v-bind="api.getDayTableCellProps({ value })">
                <div v-bind="api.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['weeks']" />
  </Toolbar>
</template>
