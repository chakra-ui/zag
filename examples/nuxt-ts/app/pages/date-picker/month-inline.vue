<script setup lang="ts">
import { parseDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"

// an inline month view constrained to march through september
const service = useMachine(datePicker.machine, {
  id: useId(),
  defaultView: "month",
  minView: "month",
  inline: true,
  defaultFocusedValue: parseDate("2026-06-01"),
  min: parseDate("2026-03-01"),
  max: parseDate("2026-09-30"),
})

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div data-testid="selected">{{ api.valueAsString.join(",") || "none" }}</div>
    <div data-testid="focused">{{ api.focusedValueAsString }}</div>
    <div v-bind="api.getContentProps()">
      <table v-bind="api.getTableProps({ view: 'month', columns: 4 })">
        <tbody v-bind="api.getTableBodyProps()">
          <tr
            v-for="(months, row) in api.getMonthsGrid({ columns: 4, format: 'short' })"
            :key="row"
            v-bind="api.getTableRowProps({ view: 'month' })"
          >
            <td
              v-for="month in months"
              :key="month.value"
              v-bind="api.getMonthTableCellProps({ ...month, columns: 4 })"
            >
              <div v-bind="api.getMonthTableCellTriggerProps({ ...month, columns: 4 })">{{ month.label }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
