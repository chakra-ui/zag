import * as dateInput from "@zag-js/date-input"
import * as popover from "@zag-js/popover"
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"

const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })
const hourCollection = numbers(12, 1),
  minuteCollection = numbers(60),
  periodCollection = wheelPicker.collection({
    items: [
      { label: "AM", value: "am" },
      { label: "PM", value: "pm" },
    ],
  })

export default function Page() {
  const id = useId(),
    [value, setValue] = useState<dateInput.DateValue[]>([]),
    [hour, setHour] = useState("12"),
    [minute, setMinute] = useState("00"),
    [period, setPeriod] = useState("am")
  const dateService = useMachine(dateInput.machine, {
    id: `${id}:input`,
    locale: "en-US",
    granularity: "minute",
    maxGranularity: "hour",
    shouldForceLeadingZeros: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  const dateApi = dateInput.connect(dateService, normalizeProps)
  const update = (nextHour = hour, nextMinute = minute, nextPeriod = period) => {
    const current = dateApi.value[0] ?? dateApi.placeholderValue
    if ("hour" in current)
      setValue([
        current.set({ hour: (Number(nextHour) % 12) + (nextPeriod === "pm" ? 12 : 0), minute: Number(nextMinute) }),
      ])
  }
  const popoverApi = popover.connect(
    useMachine(popover.machine, { id: `${id}:popover`, positioning: { placement: "bottom" }, modal: true }),
    normalizeProps,
  )
  const apis = [
    {
      label: "Hour",
      api: wheelPicker.connect(
        useMachine(wheelPicker.machine, {
          id: `${id}:hour`,
          collection: hourCollection,
          value: hour,
          infinite: true,
          onValueChange: ({ value }) => {
            if (value) {
              setHour(value)
              update(value)
            }
          },
        }),
        normalizeProps,
      ),
    },
    {
      label: "Minute",
      api: wheelPicker.connect(
        useMachine(wheelPicker.machine, {
          id: `${id}:minute`,
          collection: minuteCollection,
          value: minute,
          infinite: true,
          onValueChange: ({ value }) => {
            if (value) {
              setMinute(value)
              update(hour, value)
            }
          },
        }),
        normalizeProps,
      ),
    },
    {
      label: "Day period",
      api: wheelPicker.connect(
        useMachine(wheelPicker.machine, {
          id: `${id}:period`,
          collection: periodCollection,
          value: period,
          onValueChange: ({ value }) => {
            if (value) {
              setPeriod(value)
              update(hour, minute, value)
            }
          },
        }),
        normalizeProps,
      ),
    },
  ]
  return (
    <main className="date-input wheel-picker wheel-picker-time-input">
      <div {...dateApi.getRootProps()}>
        <label {...dateApi.getLabelProps()}>Time</label>
        <div className="wheel-picker-time-field" {...popoverApi.getAnchorProps()}>
          <div {...dateApi.getControlProps()}>
            <div {...dateApi.getSegmentGroupProps()}>
              {dateApi.getSegments().map((segment, index) => (
                <span key={index} {...dateApi.getSegmentProps({ segment })}>
                  {segment.text}
                </span>
              ))}
            </div>
          </div>
          <button aria-label="Open time picker" {...popoverApi.getTriggerProps()}>
            🕘
          </button>
        </div>
        <input {...dateApi.getHiddenInputProps()} />
      </div>
      <div {...popoverApi.getPositionerProps()}>
        <div className="wheel-picker-time-content" {...popoverApi.getContentProps()}>
          <div className="sr-only" {...popoverApi.getTitleProps()}>
            Select time
          </div>
          <div className="wheel-picker-group" role="group" aria-label="Time picker">
            {apis.map(({ label, api }) => (
              <div {...api.getRootProps()}>
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
      <output>Selected time: {dateApi.valueAsString[0] ?? "-"}</output>
    </main>
  )
}
