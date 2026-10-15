<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  selectionMode: "multiple",
  minView: "month",
  maxSelectedDates: 2,
})

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main class="date-picker">
    <output class="date-output">
      <div>Selected: {{ api.valueAsString ?? "-" }}</div>
    </output>

    <div v-bind="api.getControlProps()">
      <input v-bind="api.getInputProps()" />
      <button v-bind="api.getTriggerProps()">🗓</button>
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div :hidden="api.view !== 'month'">
          <div v-bind="api.getViewControlProps({ view: 'month' })">
            <button v-bind="api.getPreviousTriggerProps({ view: 'month' })">Prev</button>
            <button v-bind="api.getViewTriggerProps({ view: 'month' })">{{ api.visibleRange.start.year }}</button>
            <button v-bind="api.getNextTriggerProps({ view: 'month' })">Next</button>
          </div>

          <table v-bind="api.getTableProps({ view: 'month', columns: 4 })">
            <tbody v-bind="api.getTableBodyProps({ view: 'month' })">
              <tr
                v-for="(months, row) in api.getMonthsGrid({ columns: 4, format: 'short' })"
                :key="row"
                v-bind="api.getTableRowProps()"
              >
                <td
                  v-for="(month, index) in months"
                  :key="index"
                  v-bind="api.getMonthTableCellProps({ ...month, columns: 4 })"
                >
                  <div v-bind="api.getMonthTableCellTriggerProps({ ...month, columns: 4 })">{{ month.label }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['weeks']" />
  </Toolbar>
</template>
