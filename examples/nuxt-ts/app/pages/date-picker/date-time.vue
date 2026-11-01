<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const pad = (value: number) => String(value).padStart(2, "0")

const service = useMachine(datePicker.machine, {
  id: useId(),
  locale: "en",
  selectionMode: "single",
  closeOnSelect: false,
})

const api = computed(() => datePicker.connect(service, normalizeProps))

const value = computed(() => api.value.value[0])
const hasTime = computed(() => !!value.value && "hour" in value.value)

const timeValue = computed(() => {
  const v = value.value
  return v && "hour" in v ? `${pad(v.hour)}:${pad(v.minute)}` : "12:00"
})

const dateTimeString = computed(() => {
  const v = value.value
  if (!v) return "-"
  const date = `${v.year}-${pad(v.month)}-${pad(v.day)}`
  return "hour" in v ? `${date} ${pad(v.hour)}:${pad(v.minute)}` : date
})

const handleTimeChange = (e: Event) => {
  const [hours, minutes] = (e.currentTarget as HTMLInputElement).value.split(":").map(Number)
  if (hours != null && minutes != null && !isNaN(hours) && !isNaN(minutes)) {
    api.value.setTime({ hour: hours, minute: minutes, second: 0 })
  }
}
</script>

<template>
  <main class="date-picker">
    <div>
      <h2>Date-Time Picker Example</h2>
      <p>Combines Zag date picker with native time input using the new setTime API</p>
    </div>

    <output class="date-output">
      <div>Selected DateTime: {{ dateTimeString }}</div>
      <div>Has Time: {{ hasTime ? "Yes" : "No" }}</div>
    </output>

    <div v-bind="api.getControlProps()" style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px">
      <button v-bind="api.getTriggerProps()">{{ value ? dateTimeString : "Select Date & Time" }}</button>
      <button v-bind="api.getClearTriggerProps()">Clear</button>
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
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

          <div
            style="
              border-top: 1px solid #e2e8f0;
              margin-top: 12px;
              padding-top: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
            "
          >
            <label style="font-size: 14px; font-weight: 500">Time:</label>
            <input
              type="time"
              :value="timeValue"
              :disabled="!value"
              style="padding: 6px 8px; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 4px; flex: 1"
              @change="handleTimeChange"
            />
          </div>
        </div>

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
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['weeks']" />
  </Toolbar>
</template>
