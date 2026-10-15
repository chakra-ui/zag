<script setup lang="ts">
import { startOfWeek } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor

const LOCALES = {
  "en-US": {
    dir: "ltr" as const,
    translations: {
      previousTriggerLabel: "Previous",
      nextTriggerLabel: "Next",
      todayTriggerLabel: "Today",
      viewSelectLabel: "Calendar view",
      viewText: { day: "Day", week: "Week", month: "Month" },
    },
  },
  "de-DE": {
    dir: "ltr" as const,
    translations: {
      previousTriggerLabel: "Zurück",
      nextTriggerLabel: "Weiter",
      todayTriggerLabel: "Heute",
      viewSelectLabel: "Kalenderansicht",
      viewText: { day: "Tag", week: "Woche", month: "Monat" },
    },
  },
  "ar-EG": {
    dir: "rtl" as const,
    translations: {
      previousTriggerLabel: "السابق",
      nextTriggerLabel: "التالي",
      todayTriggerLabel: "اليوم",
      viewSelectLabel: "عرض التقويم",
      viewText: { day: "يوم", week: "أسبوع", month: "شهر" },
    },
  },
}

type LocaleKey = keyof typeof LOCALES

const locale = ref<LocaleKey>("en-US")
const config = computed(() => LOCALES[locale.value])
const viewTypes = ["day", "week", "month"] as const

const id = useId()
const service = useMachine(
  scheduler.machine,
  computed<scheduler.Props>(() => ({
    id,
    defaultView: "week",
    defaultDate: startOfWeek(TODAY, "en-US").add({ days: 2 }),
    locale: locale.value,
    dir: config.value.dir,
    translations: config.value.translations,
    showWeekNumbers: true,
    events: [],
  })),
)

const api = computed(() => scheduler.connect(service, normalizeProps))
</script>

<template>
  <main class="scheduler">
    <label>
      Locale
      <select v-model="locale" data-testid="locale">
        <option v-for="key in Object.keys(LOCALES)" :key="key" :value="key">{{ key }}</option>
      </select>
    </label>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getHeaderProps()">
        <button v-bind="api.getPreviousTriggerProps()">‹</button>
        <button v-bind="api.getTodayTriggerProps()">{{ config.translations.todayTriggerLabel }}</button>
        <button v-bind="api.getNextTriggerProps()">›</button>
        <span v-bind="api.getHeaderTitleProps()">{{ api.visibleRangeText.formatted }}</span>
      </div>

      <div v-bind="api.getViewSelectProps()">
        <button v-for="v in viewTypes" :key="v" v-bind="api.getViewItemProps({ view: v })">
          {{ api.getViewText(v) }}
        </button>
      </div>

      <div class="scheduler-time-grid-wrapper">
        <div v-bind="api.getColumnHeadersProps()">
          <div class="scheduler-gutter-header" />
          <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getColumnHeaderProps(column)">
            <span class="scheduler-header-day-label">{{ api.formatWeekDay(column.date) }}</span>
            <span class="scheduler-header-day-num">{{ column.date.day }}</span>
          </div>
        </div>
        <div class="scheduler-time-grid-scroll" tabindex="0" aria-label="Schedule grid">
          <div v-bind="api.getGridProps()">
            <div v-bind="api.getGridRowProps()">
              <div v-bind="api.getTimeGutterProps()">
                <div v-for="hour in api.hourRange.hours" :key="hour.value" v-bind="api.getHourLabelProps({ hour })">
                  {{ hour.label }}
                </div>
              </div>

              <div v-for="column in api.columns" :key="column.date.toString()" v-bind="api.getDayColumnProps(column)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
