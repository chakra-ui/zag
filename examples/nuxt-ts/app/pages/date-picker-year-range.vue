<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed } from "vue"
import { CalendarDate, type DateValue } from "@internationalized/date"

const format = (date: DateValue) => {
  return date?.year?.toString() ?? ""
}

// Handle full yyyy format
const parse = (string: string) => {
  const fullRegex = /^(\d{4})$/

  const fullMatch = string.match(fullRegex)
  if (!fullMatch) return

  const [_, year] = fullMatch.map(Number)
  if (!year) return

  return new CalendarDate(year, 1, 1)
}

const controls = useControls(datePickerControls)

const service = useMachine(
  datePicker.machine,
  controls.mergeProps<datePicker.Props>({
    id: useId(),
    locale: "en",
    selectionMode: "range",
    minView: "year",
    defaultView: "year",
    parse,
    format,
    placeholder: "yyyy",
  }),
)

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main class="date-picker">
    <div>
      <button>Outside Element</button>
    </div>
    <p>{{ `Visible range: ${api.visibleRangeText.formatted}` }}</p>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString.length ? api.valueAsString : "-" }}</div>
      <div>Focused: {{ api.focusedValueAsString }}</div>
    </output>

    <div v-bind="api.getControlProps()">
      <input v-bind="api.getInputProps({ index: 0 })" />
      <input v-bind="api.getInputProps({ index: 1 })" />
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

        <div v-if="api.view === 'day'" style="width: 100%">
          <div v-bind="api.getViewControlProps({ view: 'year' })">
            <button v-bind="api.getPrevTriggerProps()">Prev</button>
            <button v-bind="api.getViewTriggerProps()">{{ api.visibleRangeText.start }}</button>
            <button v-bind="api.getNextTriggerProps()">Next</button>
          </div>

          <table v-bind="api.getTableProps()">
            <thead v-bind="api.getTableHeaderProps()">
              <tr>
                <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">
                  {{ day.narrow }}
                </th>
              </tr>
            </thead>
            <tbody v-bind="api.getTableBodyProps()">
              <tr v-for="(week, i) in api.weeks" :key="i">
                <td v-for="(value, j) in week" :key="j" v-bind="api.getDayTableCellProps({ value })">
                  <div v-bind="api.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; gap: 40px; margin-top: 24px">
          <div v-if="api.view === 'month'" style="width: 100%">
            <div v-bind="api.getViewControlProps({ view: 'year' })">
              <button v-bind="api.getPrevTriggerProps({ view: 'month' })">Prev</button>
              <button v-bind="api.getViewTriggerProps({ view: 'month' })">{{ api.visibleRange.start.year }}</button>
              <button v-bind="api.getNextTriggerProps({ view: 'month' })">Next</button>
            </div>

            <table v-bind="api.getTableProps({ view: 'month', columns: 4 })">
              <tbody v-bind="api.getTableBodyProps({ view: 'month' })">
                <tr v-for="(months, row) in api.getMonthsGrid({ columns: 4, format: 'short' })" :key="row">
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

          <div v-if="api.view === 'year'" style="width: 100%">
            <div v-bind="api.getViewControlProps({ view: 'year' })">
              <button v-bind="api.getPrevTriggerProps({ view: 'year' })">Prev</button>
              <span> {{ api.getDecade().start }} - {{ api.getDecade().end }} </span>
              <button v-bind="api.getNextTriggerProps({ view: 'year' })">Next</button>
            </div>

            <table v-bind="api.getTableProps({ view: 'year', columns: 4 })">
              <tbody v-bind="api.getTableBodyProps({ view: 'year' })">
                <tr v-for="(years, row) in api.getYearsGrid({ columns: 4 })" :key="row">
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
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
