<script setup lang="ts">
import { parseDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"

// an inline year view that renders beyond the decade in view, with min 2015 and max 2035
const service = useMachine(datePicker.machine, {
  id: useId(),
  defaultView: "year",
  inline: true,
  min: parseDate("2015-01-01"),
  max: parseDate("2035-12-31"),
})

const api = computed(() => datePicker.connect(service, normalizeProps))

const decade = computed(() => api.value.getDecade())
const years = computed(() => {
  const start = (decade.value.start ?? 2020) - 10
  return Array.from({ length: 30 }, (_, i) => ({ label: String(start + i), value: start + i }))
})
</script>

<template>
  <main>
    <div data-testid="decade">{{ `${decade.start}-${decade.end}` }}</div>
    <div data-testid="selected">{{ api.valueAsString.join(",") || "none" }}</div>
    <div v-bind="api.getContentProps()">
      <table v-bind="api.getTableProps({ view: 'year', columns: 5 })">
        <tbody v-bind="api.getTableBodyProps()">
          <tr v-for="row in 6" :key="row" v-bind="api.getTableRowProps({ view: 'year' })">
            <td
              v-for="year in years.slice((row - 1) * 5, (row - 1) * 5 + 5)"
              :key="year.value"
              v-bind="api.getYearTableCellProps({ ...year, columns: 5 })"
            >
              <div v-bind="api.getYearTableCellTriggerProps({ ...year, columns: 5 })">{{ year.label }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
