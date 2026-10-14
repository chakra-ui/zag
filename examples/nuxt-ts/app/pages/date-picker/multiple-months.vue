<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  selectionMode: "single",
  numOfMonths: 2,
})

const api = computed(() => datePicker.connect(service, normalizeProps))
const offset = computed(() => api.value.getOffset({ months: 1 }))
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
        <div style="display: flex; gap: 10px">
          <button v-bind="api.getPrevTriggerProps()">Prev</button>
          <button v-bind="api.getNextTriggerProps()">Next</button>
        </div>
        <hr />
        <div>{{ api.visibleRangeText.start }}</div>
        <table v-bind="api.getTableProps({ view: 'day' })">
          <thead v-bind="api.getTableHeaderProps({ view: 'day' })">
            <tr v-bind="api.getTableRowProps({ view: 'day' })">
              <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">{{ day.narrow }}</th>
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
        <hr />
        <div>{{ offset.visibleRangeText.start }}</div>
        <table v-bind="api.getTableProps({ view: 'day' })">
          <thead v-bind="api.getTableHeaderProps()">
            <tr v-bind="api.getTableRowProps()">
              <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">{{ day.narrow }}</th>
            </tr>
          </thead>
          <tbody v-bind="api.getTableBodyProps({ view: 'day' })">
            <tr v-for="(week, i) in offset.weeks" :key="i" v-bind="api.getTableRowProps({ view: 'day' })">
              <td
                v-for="(value, i) in week"
                :key="i"
                v-bind="api.getDayTableCellProps({ value, visibleRange: offset.visibleRange })"
              >
                <div v-bind="api.getDayTableCellTriggerProps({ value, visibleRange: offset.visibleRange })">
                  {{ value.day }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; gap: 40px">
        <div v-bind="api.getViewProps({ view: 'month' })">
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

        <div v-bind="api.getViewProps({ view: 'year' })">
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
  </main>
</template>
