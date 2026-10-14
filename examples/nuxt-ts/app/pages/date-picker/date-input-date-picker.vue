<script setup lang="ts">
import { getLocalTimeZone } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const timeZone = getLocalTimeZone()

const id = useId()
const datePickerService = useMachine(
  datePicker.machine,
  computed(() => ({
    id,
    locale: "en",
    selectionMode: "single",
    timeZone,
  })),
)

const datePickerApi = computed(() => datePicker.connect(datePickerService, normalizeProps))

const id2 = useId()
const dateInputService = useMachine(
  dateInput.machine,
  computed(() => ({
    id: id2,
    locale: "en",
    selectionMode: "single",
    timeZone,
    value: datePickerApi.value.value,
    onValueChange(details) {
      datePickerApi.value.setValue(details.value)
    },
  })),
)

const dateInputApi = computed(() => dateInput.connect(dateInputService, normalizeProps))
</script>

<template>
  <main class="date-input date-picker">
    <output class="date-output">
      <div>Selected: {{ datePickerApi.valueAsString ?? "-" }}</div>
    </output>

    <div v-bind="datePickerApi.getControlProps()" style="display: flex; align-items: center; gap: 8px">
      <div v-bind="dateInputApi.getRootProps()">
        <label v-bind="dateInputApi.getLabelProps()">Date</label>
        <div v-bind="dateInputApi.getControlProps()">
          <div v-bind="dateInputApi.getSegmentGroupProps()">
            <span
              v-for="(segment, i) in dateInputApi.getSegments()"
              :key="i"
              v-bind="dateInputApi.getSegmentProps({ segment })"
              >{{ segment.text }}</span
            >
          </div>
        </div>
      </div>

      <button v-bind="datePickerApi.getTriggerProps()">📅</button>
      <button v-bind="datePickerApi.getClearTriggerProps()">Clear</button>
    </div>

    <div v-bind="datePickerApi.getPositionerProps()">
      <div v-bind="datePickerApi.getContentProps()">
        <div style="margin-bottom: 20px">
          <select v-bind="datePickerApi.getMonthSelectProps()">
            <option
              v-for="(month, i) in datePickerApi.getMonths()"
              :key="i"
              :value="month.value"
              :disabled="month.disabled"
            >
              {{ month.label }}
            </option>
          </select>

          <select v-bind="datePickerApi.getYearSelectProps()">
            <option
              v-for="(year, i) in datePickerApi.getYears()"
              :key="i"
              :value="year.value"
              :disabled="year.disabled"
            >
              {{ year.label }}
            </option>
          </select>
        </div>

        <div :hidden="datePickerApi.view !== 'day'">
          <div v-bind="datePickerApi.getViewControlProps({ view: 'year' })">
            <button v-bind="datePickerApi.getPrevTriggerProps()">Prev</button>
            <button v-bind="datePickerApi.getViewTriggerProps()">{{ datePickerApi.visibleRangeText.start }}</button>
            <button v-bind="datePickerApi.getNextTriggerProps()">Next</button>
          </div>

          <table v-bind="datePickerApi.getTableProps({ view: 'day' })">
            <thead v-bind="datePickerApi.getTableHeaderProps({ view: 'day' })">
              <tr v-bind="datePickerApi.getTableRowProps({ view: 'day' })">
                <th v-for="(day, i) in datePickerApi.weekDays" :key="i" scope="col" :aria-label="day.long">
                  {{ day.narrow }}
                </th>
              </tr>
            </thead>
            <tbody v-bind="datePickerApi.getTableBodyProps({ view: 'day' })">
              <tr
                v-for="(week, i) in datePickerApi.weeks"
                :key="i"
                v-bind="datePickerApi.getTableRowProps({ view: 'day' })"
              >
                <td v-for="(value, i) in week" :key="i" v-bind="datePickerApi.getDayTableCellProps({ value })">
                  <div v-bind="datePickerApi.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="datePickerService" :omit="['weeks']" />
  </Toolbar>
</template>
