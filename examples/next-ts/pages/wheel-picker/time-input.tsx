import * as dateInput from "@zag-js/date-input"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/react"
import { defineControls } from "@zag-js/shared"
import * as wheelPicker from "@zag-js/wheel-picker"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface WheelPickerOption {
  label: string
  value: string
}

interface TimeParts {
  hour: string
  minute: string
  dayPeriod: "am" | "pm"
}

const createArray = (length: number, locale: string, add = 0): WheelPickerOption[] => {
  const formatter = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false })

  return Array.from({ length }, (_, index) => {
    const value = index + add
    return {
      label: formatter.format(value),
      value: value.toString(),
    }
  })
}

const getDayPeriodLabel = (locale: string, hour: number) =>
  new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true })
    .formatToParts(new Date(2020, 0, 1, hour))
    .find((part) => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM")

const getHourConfig = (hourCycle: dateInput.ResolvedHourCycle) => {
  switch (hourCycle) {
    case "h11":
      return { length: 12, add: 0 }
    case "h12":
      return { length: 12, add: 1 }
    case "h24":
      return { length: 24, add: 1 }
    default:
      return { length: 24, add: 0 }
  }
}

const getDisplayHour = (hour: number, hourCycle: dateInput.ResolvedHourCycle) => {
  switch (hourCycle) {
    case "h11":
      return hour % 12
    case "h12":
      return hour % 12 || 12
    case "h24":
      return hour || 24
    default:
      return hour
  }
}

function getTimeParts(value: dateInput.DateValue | undefined, hourCycle: dateInput.ResolvedHourCycle): TimeParts {
  const hour = value && "hour" in value ? value.hour : 0
  const minute = value && "minute" in value ? value.minute : 0

  return {
    hour: String(getDisplayHour(hour, hourCycle)),
    minute: String(minute),
    dayPeriod: hour >= 12 ? "pm" : "am",
  }
}

function get24Hour({ hour, dayPeriod }: TimeParts, hourCycle: dateInput.ResolvedHourCycle) {
  const hourValue = Number(hour)
  if (hourCycle === "h23") return hourValue
  if (hourCycle === "h24") return hourValue % 24

  return (hourValue % 12) + (dayPeriod === "pm" ? 12 : 0)
}

const getHourCollection = (locale: string, hourCycle: dateInput.ResolvedHourCycle) => {
  const { length, add } = getHourConfig(hourCycle)
  return wheelPicker.collection({ items: createArray(length, locale, add) })
}

const getMinuteCollection = (locale: string) => wheelPicker.collection({ items: createArray(60, locale) })

const getDayPeriodCollection = (locale: string) =>
  wheelPicker.collection({
    items: [
      { label: getDayPeriodLabel(locale, 0), value: "am" },
      { label: getDayPeriodLabel(locale, 12), value: "pm" },
    ],
  })

const localeControls = defineControls({
  locale: {
    type: "select",
    options: ["en-US", "en-GB", "fr-FR", "de-DE", "cs-CZ", "ja-JP", "mk-MK", "zh-CN"] as const,
    defaultValue: "en-US",
  },
})

export default function Page() {
  const id = useId()
  const controls = useControls(localeControls)
  const locale = controls.context.locale
  const [value, setValue] = useState<dateInput.DateValue[]>([])
  const dateInputService = useMachine(dateInput.machine, {
    id: `${id}:input`,
    locale,
    granularity: "minute",
    maxGranularity: "hour",
    shouldForceLeadingZeros: true,
    name: "time",
    value,
    onValueChange(details) {
      setValue(details.value)
    },
  })
  const dateInputApi = dateInput.connect(dateInputService, normalizeProps)
  const hourCollection = useMemo(
    () => getHourCollection(locale, dateInputApi.resolvedHourCycle),
    [locale, dateInputApi.resolvedHourCycle],
  )
  const minuteCollection = useMemo(() => getMinuteCollection(locale), [locale])
  const dayPeriodCollection = useMemo(() => getDayPeriodCollection(locale), [locale])
  const time = getTimeParts(dateInputApi.value[0] ?? dateInputApi.placeholderValue, dateInputApi.resolvedHourCycle)

  const updateTime = <Part extends keyof TimeParts>(part: Part, partValue: TimeParts[Part]) => {
    setValue((currentValue) => {
      const currentTime = currentValue[0] ?? dateInputApi.placeholderValue
      if (!("hour" in currentTime)) return currentValue

      const nextTime = { ...getTimeParts(currentTime, dateInputApi.resolvedHourCycle), [part]: partValue }
      return [
        currentTime.set({ hour: get24Hour(nextTime, dateInputApi.resolvedHourCycle), minute: Number(nextTime.minute) }),
      ]
    })
  }

  const popoverService = useMachine(popover.machine, {
    id: `${id}:popover`,
    positioning: { placement: "bottom" },
  })
  const hourService = useMachine(wheelPicker.machine, {
    id: `${id}:hour`,
    collection: hourCollection,
    value: time.hour,
    infinite: true,
    onValueChange(details) {
      if (details.value) updateTime("hour", details.value)
    },
  })
  const minuteService = useMachine(wheelPicker.machine, {
    id: `${id}:minute`,
    collection: minuteCollection,
    value: time.minute,
    infinite: true,
    onValueChange(details) {
      if (details.value) updateTime("minute", details.value)
    },
  })
  const dayPeriodService = useMachine(wheelPicker.machine, {
    id: `${id}:day-period`,
    collection: dayPeriodCollection,
    value: time.dayPeriod,
    onValueChange(details) {
      if (details.value === "am" || details.value === "pm") updateTime("dayPeriod", details.value)
    },
  })

  const popoverApi = popover.connect(popoverService, normalizeProps)
  const hourApi = wheelPicker.connect(hourService, normalizeProps)
  const minuteApi = wheelPicker.connect(minuteService, normalizeProps)
  const dayPeriodApi = wheelPicker.connect(dayPeriodService, normalizeProps)
  const pickers = [
    { api: hourApi, label: "Hour" },
    { api: minuteApi, label: "Minute" },
    ...(dateInputApi.resolvedHourCycle === "h11" || dateInputApi.resolvedHourCycle === "h12"
      ? [{ api: dayPeriodApi, label: "Day period" }]
      : []),
  ]

  return (
    <>
      <main className="date-input wheel-picker wheel-picker-time-input">
        <div {...dateInputApi.getRootProps()}>
          <label {...dateInputApi.getLabelProps()}>Time</label>
          <div {...popoverApi.getAnchorProps()} className="wheel-picker-time-field">
            <div {...dateInputApi.getControlProps()}>
              <div {...dateInputApi.getSegmentGroupProps()}>
                {dateInputApi.getSegments().map((segment, index) => (
                  <span key={index} {...dateInputApi.getSegmentProps({ segment })}>
                    {segment.text}
                  </span>
                ))}
              </div>
            </div>
            <button {...popoverApi.getTriggerProps()} aria-label="Open time picker">
              🕘
            </button>
          </div>
          <input {...dateInputApi.getHiddenInputProps()} />
        </div>

        <div {...popoverApi.getPositionerProps()}>
          <div className="wheel-picker-time-content" {...popoverApi.getContentProps()}>
            <div className="sr-only" {...popoverApi.getTitleProps()}>
              Select time
            </div>
            <div className="sr-only" {...popoverApi.getDescriptionProps()}>
              Choose an hour, minute, and day period.
            </div>

            <div className="wheel-picker-group" role="group" aria-label="Time picker">
              {pickers.map(({ api, label }) => (
                <div key={label} {...api.getRootProps()}>
                  <label className="sr-only" {...api.getLabelProps()}>
                    {label}
                  </label>
                  <div {...api.getControlProps()}>
                    <div {...api.getViewportProps()}>
                      <ul {...api.getItemGroupProps()}>
                        {api.items.map(({ item, index, key }) => (
                          <li key={key} {...api.getItemProps({ item, index })}>
                            {item.label}
                          </li>
                        ))}
                      </ul>

                      <div {...api.getHighlightProps()}>
                        <ul {...api.getHighlightItemGroupProps()}>
                          {api.highlightItems.map(({ item, index, key }) => (
                            <li key={key} {...api.getHighlightItemProps({ item, index })}>
                              {item.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <output data-testid="value">Selected time: {dateInputApi.valueAsString[0] ?? "-"}</output>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={dateInputService} />
      </Toolbar>
    </>
  )
}
