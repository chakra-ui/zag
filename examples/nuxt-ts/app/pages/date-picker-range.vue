<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed } from "vue"

const controls = useControls(datePickerControls)

const service = useMachine(
  datePicker.machine,
  controls.mergeProps<datePicker.Props>({
    id: useId(),
    name: "date[]",
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
  }),
)

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
      <div>Selected: {{ api.valueAsString.join(", ") ?? "-" }}</div>
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
            <option v-for="(month, i) in api.getMonths()" :key="i" :value="i + 1">
              {{ month.label }}
            </option>
          </select>

          <select v-bind="api.getYearSelectProps()">
            <option v-for="(year, i) in api.getYears()" :key="i" :value="year.value">
              {{ year.label }}
            </option>
          </select>
        </div>

        <div>
          <div v-bind="api.getViewControlProps({ view: 'year' })">
            <button v-bind="api.getPrevTriggerProps()">Prev</button>
            <span> {{ api.visibleRangeText.start }} - {{ api.visibleRangeText.end }} </span>
            <button v-bind="api.getNextTriggerProps()">Next</button>
          </div>

          <div style="display: flex; gap: 24px">
            <table v-bind="api.getTableProps()">
              <thead v-bind="api.getTableHeaderProps()">
                <tr v-bind="api.getTableRowProps()">
                  <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">
                    {{ day.narrow }}
                  </th>
                </tr>
              </thead>
              <tbody v-bind="api.getTableBodyProps()">
                <tr v-for="(week, i) in api.weeks" :key="i" v-bind="api.getTableRowProps()">
                  <td v-for="(value, i) in week" :key="i" v-bind="api.getDayTableCellProps({ value })">
                    <div v-bind="api.getDayTableCellTriggerProps({ value })">{{ value.day }}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table v-bind="api.getTableProps()">
              <thead v-bind="api.getTableHeaderProps()">
                <tr v-bind="api.getTableRowProps()">
                  <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long">
                    {{ day.narrow }}
                  </th>
                </tr>
              </thead>
              <tbody v-bind="api.getTableBodyProps()">
                <tr v-for="(week, i) in offset.weeks" :key="i" v-bind="api.getTableRowProps()">
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

            <div style="min-width: 80px; display: flex; flex-direction: column; gap: 4px">
              <b>Presets</b>
              <button v-bind="api.getPresetTriggerProps({ value: 'last3Days' })">Last 3 Days</button>
              <button v-bind="api.getPresetTriggerProps({ value: 'last7Days' })">Last 7 Days</button>
              <button v-bind="api.getPresetTriggerProps({ value: 'last14Days' })">Last 14 Days</button>
              <button v-bind="api.getPresetTriggerProps({ value: 'last30Days' })">Last 30 Days</button>
              <button v-bind="api.getPresetTriggerProps({ value: 'last90Days' })">Last 90 Days</button>
            </div>
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
