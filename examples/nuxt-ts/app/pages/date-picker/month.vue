<script setup lang="ts">
import { CalendarDate, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const format = (date: DateValue) => {
  const month = date.month.toString().padStart(2, "0")
  const year = date.year.toString()
  return `${month}/${year}`
}

const parse = (string: string) => {
  // Handle full mm/yyyy format
  const fullRegex = /^(\d{1,2})\/(\d{4})$/
  const fullMatch = string.match(fullRegex)
  if (fullMatch) {
    const [_, month, year] = fullMatch.map(Number)
    if (month && year) return new CalendarDate(year, month, 1)
  }

  return undefined
}

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  minView: "month",
  placeholder: "mm/yyyy",
  format,
  parse,
})

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main class="date-picker">
    <div>
      <button>Outside Element</button>
    </div>
    <p>{{ `Visible range: ${api.visibleRangeText.formatted}` }}</p>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString ?? "-" }}</div>
      <div>Focused: {{ api.focusedValueAsString }}</div>
    </output>

    <div v-bind="api.getControlProps()">
      <input v-bind="api.getInputProps()" />
      <button v-bind="api.getClearTriggerProps()">❌</button>
      <button v-bind="api.getTriggerProps()">🗓</button>
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div style="display: flex; gap: 40px">
          <div :hidden="api.view !== 'month'" style="width: 100%">
            <div v-bind="api.getViewControlProps({ view: 'month' })">
              <button v-bind="api.getPrevTriggerProps({ view: 'month' })">Prev</button>
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

          <div :hidden="api.view !== 'year'" style="width: 100%">
            <div v-bind="api.getViewControlProps({ view: 'year' })">
              <button v-bind="api.getPrevTriggerProps({ view: 'year' })">Prev</button>
              <span> {{ api.getDecade().start }} - {{ api.getDecade().end }} </span>
              <button v-bind="api.getNextTriggerProps({ view: 'year' })">Next</button>
            </div>

            <table v-bind="api.getTableProps({ view: 'year', columns: 4 })">
              <tbody v-bind="api.getTableBodyProps()">
                <tr
                  v-for="(years, row) in api.getYearsGrid({ columns: 4 })"
                  :key="row"
                  v-bind="api.getTableRowProps({ view: 'year' })"
                >
                  <td
                    v-for="(year, index) in years"
                    :key="index"
                    v-bind="api.getYearTableCellProps({ ...year, columns: 4 })"
                  >
                    <div v-bind="api.getYearTableCellTriggerProps({ ...year, columns: 4 })">{{ year.label }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['weeks']" />
  </Toolbar>
</template>
