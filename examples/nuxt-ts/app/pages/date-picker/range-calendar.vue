<script setup lang="ts">
import { getLocalTimeZone } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const controls = useControls(datePickerControls)
const tableId = useId()

const service = useMachine(
  datePicker.machine,
  controls.mergeProps<datePicker.Props>({
    id: useId(),
    locale: "en-US",
    numOfMonths: 1,
    selectionMode: "range",
    outsideDaySelectable: true,
    inline: true,
    timeZone: getLocalTimeZone(),
  }),
)

const api = computed(() => datePicker.connect(service, normalizeProps))
</script>

<template>
  <main class="date-picker">
    <div>
      <button type="button">Outside Element</button>
    </div>

    <p>
      <strong>Inline range · single month · outside days selectable</strong>
    </p>
    <p>
      Click two dates for a range, then hover outside-month cells before the second click — the visible month should
      stay put.
    </p>
    <p>{{ `Visible range: ${api.visibleRangeText.formatted}` }}</p>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString.join(" → ") || "-" }}</div>
      <div>Focused: {{ api.focusedValueAsString }}</div>
    </output>

    <div style="margin-bottom: 12px">
      <button type="button" v-bind="api.getClearTriggerProps()">Clear</button>
    </div>

    <div v-bind="api.getRootProps()">
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
          <div v-bind="api.getViewControlProps({ view: 'day' })">
            <button type="button" v-bind="api.getPrevTriggerProps()">Prev</button>
            <button type="button" v-bind="api.getViewTriggerProps()">{{ api.visibleRangeText.start }}</button>
            <button type="button" v-bind="api.getNextTriggerProps()">Next</button>
          </div>

          <table v-bind="api.getTableProps({ view: 'day', id: tableId })">
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
              <button type="button" v-bind="api.getPrevTriggerProps({ view: 'month' })">Prev</button>
              <button type="button" v-bind="api.getViewTriggerProps({ view: 'month' })">
                {{ api.visibleRange.start.year }}
              </button>
              <button type="button" v-bind="api.getNextTriggerProps({ view: 'month' })">Next</button>
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
              <button type="button" v-bind="api.getPrevTriggerProps({ view: 'year' })">Prev</button>
              <span> {{ api.getDecade().start }} - {{ api.getDecade().end }} </span>
              <button type="button" v-bind="api.getNextTriggerProps({ view: 'year' })">Next</button>
            </div>

            <table v-bind="api.getTableProps({ view: 'year', columns: 4 })">
              <tbody v-bind="api.getTableBodyProps({ view: 'year' })">
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
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
