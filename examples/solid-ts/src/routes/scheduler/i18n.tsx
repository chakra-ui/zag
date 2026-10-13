import { startOfWeek } from "@internationalized/date"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scheduler.css"

const TODAY = schedulerAnchor

const LOCALES = {
  "en-US": {
    dir: "ltr" as const,
    translations: {
      prevTriggerLabel: "Previous",
      nextTriggerLabel: "Next",
      todayTriggerLabel: "Today",
      viewSelectLabel: "Calendar view",
      viewText: { day: "Day", week: "Week", month: "Month" },
    },
  },
  "de-DE": {
    dir: "ltr" as const,
    translations: {
      prevTriggerLabel: "Zurück",
      nextTriggerLabel: "Weiter",
      todayTriggerLabel: "Heute",
      viewSelectLabel: "Kalenderansicht",
      viewText: { day: "Tag", week: "Woche", month: "Monat" },
    },
  },
  "ar-EG": {
    dir: "rtl" as const,
    translations: {
      prevTriggerLabel: "السابق",
      nextTriggerLabel: "التالي",
      todayTriggerLabel: "اليوم",
      viewSelectLabel: "عرض التقويم",
      viewText: { day: "يوم", week: "أسبوع", month: "شهر" },
    },
  },
}

type LocaleKey = keyof typeof LOCALES

const VIEWS = ["day", "week", "month"] as const

export default function Page() {
  const [locale, setLocale] = createSignal<LocaleKey>("en-US")
  const config = () => LOCALES[locale()]

  const id = createUniqueId()
  const service = useMachine(scheduler.machine, (): scheduler.Props => ({
    id,
    defaultView: "week",
    defaultDate: startOfWeek(TODAY, "en-US").add({ days: 2 }),
    locale: locale(),
    dir: config().dir,
    translations: config().translations,
    showWeekNumbers: true,
    events: [],
  }))

  const api = createMemo(() => scheduler.connect(service, normalizeProps))

  return (
    <>
      <main class="scheduler">
        <label>
          Locale{" "}
          <select data-testid="locale" onChange={(e) => setLocale(e.currentTarget.value as LocaleKey)}>
            <For each={Object.keys(LOCALES)}>
              {(key) => (
                <option value={key} selected={key === locale()}>
                  {key}
                </option>
              )}
            </For>
          </select>
        </label>

        <div {...api().getRootProps()}>
          <div {...api().getHeaderProps()}>
            <button {...api().getPrevTriggerProps()}>‹</button>
            <button {...api().getTodayTriggerProps()}>{config().translations.todayTriggerLabel}</button>
            <button {...api().getNextTriggerProps()}>›</button>
            <span {...api().getHeaderTitleProps()}>{api().visibleRangeText.formatted}</span>
          </div>

          <div {...api().getViewSelectProps()}>
            <For each={VIEWS}>
              {(v) => <button {...api().getViewItemProps({ view: v })}>{api().getViewText(v)}</button>}
            </For>
          </div>

          <div class="scheduler-time-grid-wrapper">
            <div {...api().getColumnHeadersProps()}>
              <div class="scheduler-gutter-header" />
              <Index each={api().columns}>
                {(column) => (
                  <div {...api().getColumnHeaderProps(column())}>
                    <span class="scheduler-header-day-label">{api().formatWeekDay(column().date)}</span>
                    <span class="scheduler-header-day-num">{column().date.day}</span>
                  </div>
                )}
              </Index>
            </div>

            <div class="scheduler-time-grid-scroll" tabIndex={0} aria-label="Schedule grid">
              <div {...api().getGridProps()}>
                <div {...api().getGridRowProps()}>
                  <div {...api().getTimeGutterProps()}>
                    <Index each={api().hourRange.hours}>
                      {(hour) => <div {...api().getHourLabelProps({ hour: hour() })}>{hour().label}</div>}
                    </Index>
                  </div>
                  <Index each={api().columns}>{(column) => <div {...api().getDayColumnProps(column())} />}</Index>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
