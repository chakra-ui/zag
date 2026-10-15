<script setup lang="ts">
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-picker.css"

const open = ref(false)

const id = useId()
const service = useMachine(
  datePicker.machine,
  computed(() => ({
    id,
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
    open: open.value,
    onOpenChange(details) {
      open.value = details.open
    },
  })),
)

const api = computed(() => datePicker.connect(service, normalizeProps))
const offset = computed(() => api.value.getOffset({ months: 1 }))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>DateRange Picker Controlled</h1>
    <h1>{{ String(open) }}</h1>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>
    </div>

    <main class="date-picker">
      <p>{{ `Visible range: ${api.visibleRangeText.formatted}` }}</p>

      <output class="date-output">
        <div>Selected: {{ api.valueAsString ?? "-" }}</div>
        <div>Focused: {{ api.focusedValueAsString }}</div>
      </output>

      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps({ index: 0 })" />
        <input v-bind="api.getInputProps({ index: 1 })" />
        <button v-bind="api.getClearTriggerProps()">❌</button>
        <button v-bind="api.getTriggerProps()">🗓</button>
      </div>

      <div v-bind="api.getContentProps()">
        <div style="margin-bottom: 20px">
          <select v-bind="api.getMonthSelectProps()">
            <option v-for="(month, i) in api.getMonths()" :key="i" :value="i + 1" :disabled="month.disabled">
              {{ month.label }}
            </option>
          </select>

          <select v-bind="api.getYearSelectProps()">
            <option v-for="(year, i) in api.getYears()" :key="i" :value="year.value" :disabled="year.disabled">
              {{ year.label }}
            </option>
          </select>
        </div>

        <div>
          <div v-bind="api.getViewControlProps({ view: 'year' })">
            <button v-bind="api.getPreviousTriggerProps()">Prev</button>
            <span> {{ api.visibleRangeText.start }} - {{ api.visibleRangeText.end }} </span>
            <button v-bind="api.getNextTriggerProps()">Next</button>
          </div>

          <div style="display: flex; gap: 24px">
            <table v-bind="api.getTableProps({ id: 'r1' })">
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

            <table v-bind="api.getTableProps({ id: 'r2' })">
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
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
