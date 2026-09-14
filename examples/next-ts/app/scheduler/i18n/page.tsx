"use client"

import { startOfWeek } from "@internationalized/date"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scheduler from "@zag-js/scheduler"
import { schedulerAnchor } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
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

export default function Page() {
  const [locale, setLocale] = useState<LocaleKey>("en-US")
  const config = LOCALES[locale]

  const service = useMachine(scheduler.machine, {
    id: useId(),
    defaultView: "week",
    defaultDate: startOfWeek(TODAY, "en-US").add({ days: 2 }),
    locale,
    dir: config.dir,
    translations: config.translations,
    showWeekNumbers: true,
    events: [],
  })

  const api = scheduler.connect(service, normalizeProps)

  return (
    <>
      <main className="scheduler">
        <label>
          Locale{" "}
          <select data-testid="locale" value={locale} onChange={(e) => setLocale(e.target.value as LocaleKey)}>
            {Object.keys(LOCALES).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <div {...api.getRootProps()}>
          <div {...api.getHeaderProps()}>
            <button {...api.getPrevTriggerProps()}>‹</button>
            <button {...api.getTodayTriggerProps()}>{config.translations.todayTriggerLabel}</button>
            <button {...api.getNextTriggerProps()}>›</button>
            <span {...api.getHeaderTitleProps()}>{api.visibleRangeText.formatted}</span>
          </div>

          <div {...api.getViewSelectProps()}>
            {(["day", "week", "month"] as const).map((v) => (
              <button key={v} {...api.getViewItemProps({ view: v })}>
                {api.getViewText(v)}
              </button>
            ))}
          </div>

          <div className="scheduler-time-grid-wrapper">
            <div {...api.getColumnHeadersProps()}>
              <div className="scheduler-gutter-header" />
              {api.columns.map((column) => (
                <div key={column.date.toString()} {...api.getColumnHeaderProps(column)}>
                  <span className="scheduler-header-day-label">{api.formatWeekDay(column.date)}</span>
                  <span className="scheduler-header-day-num">{column.date.day}</span>
                </div>
              ))}
            </div>

            <div className="scheduler-time-grid-scroll" tabIndex={0} aria-label="Schedule grid">
              <div {...api.getGridProps()}>
                <div {...api.getGridRowProps()}>
                  <div {...api.getTimeGutterProps()}>
                    {api.hourRange.hours.map((hour) => (
                      <div key={hour.value} {...api.getHourLabelProps({ hour })}>
                        {hour.label}
                      </div>
                    ))}
                  </div>
                  {api.columns.map((column) => (
                    <div key={column.date.toString()} {...api.getDayColumnProps(column)} />
                  ))}
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
