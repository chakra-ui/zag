<script setup lang="ts">
import { CalendarDate, type DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

// parse dd/mm/yy to DateValue
const parse = (value: string) => {
  // Handle full dd/mm/yy format
  const fullRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
  const fullMatch = value.match(fullRegex)
  if (fullMatch) {
    const [_, day, month, year] = fullMatch.map(Number) as [number, number, number, number]
    try {
      return new CalendarDate(year + 2000, month, day)
    } catch {
      return undefined
    }
  }

  // Handle dd/mm format
  const partialRegex = /^(\d{1,2})\/(\d{1,2})$/
  const partialMatch = value.match(partialRegex)
  if (partialMatch) {
    const [_, day, month] = partialMatch.map(Number) as [number, number, number]
    const currentYear = new Date().getFullYear()
    try {
      return new CalendarDate(currentYear, month, day)
    } catch {
      return undefined
    }
  }

  // Handle dd format
  const dayRegex = /^(\d{1,2})$/
  const dayMatch = value.match(dayRegex)
  if (dayMatch) {
    const [_, day] = dayMatch.map(Number) as [number, number]
    const currentYear = new Date().getFullYear()
    return new CalendarDate(currentYear, 1, day)
  }

  return undefined
}

// convert DateValue to dd/mm/yy
const format = (date: DateValue) => {
  const day = date.day.toString().padStart(2, "0")
  const month = date.month.toString().padStart(2, "0")
  const year = (date.year % 100).toString().padStart(2, "0")
  return `${day}/${month}/${year}`
}

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  selectionMode: "single",
  parse,
  format,
  placeholder: "dd/mm/yy",
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
        <div style="margin-bottom: 20px">
          <select v-bind="api.getMonthSelectProps()">
            <option v-for="(month, i) in api.getMonths()" :key="i" :value="month.value" :disabled="month.disabled">
              {{ month.label }}
            </option>
          </select>

          <select v-bind="api.getYearSelectProps()">
            <option v-for="(year, i) in api.getYears()" :key="i" :value="year.value" :disabled="year.disabled">
              {{ year.label }}
            </option>
          </select>
        </div>

        <div :hidden="api.view !== 'day'">
          <div v-bind="api.getViewControlProps({ view: 'year' })">
            <button v-bind="api.getPreviousTriggerProps()">Prev</button>
            <button v-bind="api.getViewTriggerProps()">{{ api.visibleRangeText.start }}</button>
            <button v-bind="api.getNextTriggerProps()">Next</button>
          </div>

          <table v-bind="api.getTableProps({ view: 'day' })">
            <thead v-bind="api.getTableHeaderProps({ view: 'day' })">
              <tr v-bind="api.getTableRowProps({ view: 'day' })">
                <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">
                  {{ day.narrow }}
                </th>
              </tr>
            </thead>
            <tbody v-bind="api.getTableBodyProps({ view: 'day' })">
              <tr v-for="(week, i) in api.weeks" :key="i" v-bind="api.getTableRowProps({ view: 'day' })">
                <td v-for="(value, i) in week" :key="i" v-bind="api.getDayTableCellProps({ value })">
                  <div v-bind="api.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; gap: 40px">
          <div :hidden="api.view !== 'month'" style="width: 100%">
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

          <div :hidden="api.view !== 'year'" style="width: 100%">
            <div v-bind="api.getViewControlProps({ view: 'year' })">
              <button v-bind="api.getPreviousTriggerProps({ view: 'year' })">Prev</button>
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
</template>
