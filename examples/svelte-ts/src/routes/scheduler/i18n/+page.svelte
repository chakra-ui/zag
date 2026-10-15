<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { startOfWeek } from "@internationalized/date"
  import * as scheduler from "@zag-js/scheduler"
  import { schedulerAnchor } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
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

  let locale = $state<LocaleKey>("en-US")
  const config = $derived(LOCALES[locale])

  const id = $props.id()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "week",
    defaultDate: startOfWeek(TODAY, "en-US").add({ days: 2 }),
    locale,
    dir: config.dir,
    translations: config.translations,
    showWeekNumbers: true,
    events: [],
  }))

  const api = $derived(scheduler.connect(service, normalizeProps))
</script>

<main class="scheduler">
  <label>
    Locale{" "}
    <select data-testid="locale" value={locale} onchange={(e) => (locale = e.currentTarget.value as LocaleKey)}>
      {#each Object.keys(LOCALES) as key (key)}
        <option value={key}>
          {key}
        </option>
      {/each}
    </select>
  </label>

  <div {...api.getRootProps()}>
    <div {...api.getHeaderProps()}>
      <button {...api.getPreviousTriggerProps()}>‹</button>
      <button {...api.getTodayTriggerProps()}>{config.translations.todayTriggerLabel}</button>
      <button {...api.getNextTriggerProps()}>›</button>
      <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
    </div>

    <div {...api.getViewSelectProps()}>
      {#each ["day", "week", "month"] as const as v (v)}
        <button {...api.getViewItemProps({ view: v })}>
          {api.getViewText(v)}
        </button>
      {/each}
    </div>

    <div class="scheduler-time-grid-wrapper">
      <div {...api.getColumnHeadersProps()}>
        <div class="scheduler-gutter-header"></div>
        {#each api.columns as column (column.date.toString())}
          <div {...api.getColumnHeaderProps(column)}>
            <span class="scheduler-header-day-label">{api.formatWeekDay(column.date)}</span>
            <span class="scheduler-header-day-num">{column.date.day}</span>
          </div>
        {/each}
      </div>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="scheduler-time-grid-scroll" tabindex="0" aria-label="Schedule grid">
        <div {...api.getGridProps()}>
          <div {...api.getGridRowProps()}>
            <div {...api.getTimeGutterProps()}>
              {#each api.hourRange.hours as hour (hour.value)}
                <div {...api.getHourLabelProps({ hour })}>
                  {hour.label}
                </div>
              {/each}
            </div>
            {#each api.columns as column (column.date.toString())}
              <div {...api.getDayColumnProps(column)}></div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
