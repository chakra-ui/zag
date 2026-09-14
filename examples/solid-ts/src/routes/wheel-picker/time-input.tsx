import * as dateInput from "@zag-js/date-input"
import * as popover from "@zag-js/popover"
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"

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

function Picker(props: {
  label: string
  collection: typeof hourCollection
  value: string
  infinite?: boolean
  onChange: (value: string) => void
}) {
  const id = createUniqueId()
  const service = useMachine(wheelPicker.machine, () => ({
    id,
    collection: props.collection,
    value: props.value,
    infinite: props.infinite,
    onValueChange: ({ value }) => value && props.onChange(value),
  }))
  const api = createMemo(() => wheelPicker.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label class="sr-only" {...api().getLabelProps()}>
        {props.label}
      </label>
      <div {...api().getControlProps()}>
        <div {...api().getViewportProps()}>
          <ul {...api().getItemGroupProps()}>
            <For each={api().items}>
              {({ item, index }) => <li {...api().getItemProps({ item, index })}>{item.label}</li>}
            </For>
          </ul>
          <div {...api().getHighlightProps()}>
            <ul {...api().getHighlightItemGroupProps()}>
              <For each={api().highlightItems}>
                {({ item, index }) => <li {...api().getHighlightItemProps({ item, index })}>{item.label}</li>}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const id = createUniqueId(),
    [value, setValue] = createSignal<dateInput.DateValue[]>([]),
    [hour, setHour] = createSignal("12"),
    [minute, setMinute] = createSignal("00"),
    [period, setPeriod] = createSignal("am")
  const dateService = useMachine(dateInput.machine, () => ({
    id: `${id}:input`,
    locale: "en-US",
    granularity: "minute" as const,
    maxGranularity: "hour" as const,
    shouldForceLeadingZeros: true,
    value: value(),
    onValueChange: ({ value }) => setValue(value),
  }))
  const dateApi = createMemo(() => dateInput.connect(dateService, normalizeProps))
  const popoverService = useMachine(popover.machine, {
    id: `${id}:popover`,
    positioning: { placement: "bottom" },
    modal: true,
  })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))
  const update = (nextHour = hour(), nextMinute = minute(), nextPeriod = period()) => {
    const current = dateApi().value[0] ?? dateApi().placeholderValue
    if ("hour" in current)
      setValue([
        current.set({
          hour: (Number(nextHour) % 12) + (nextPeriod === "pm" ? 12 : 0),
          minute: Number(nextMinute),
        }),
      ])
  }
  return (
    <main class="date-input wheel-picker wheel-picker-time-input">
      <div {...dateApi().getRootProps()}>
        <label {...dateApi().getLabelProps()}>Time</label>
        <div class="wheel-picker-time-field" {...popoverApi().getAnchorProps()}>
          <div {...dateApi().getControlProps()}>
            <div {...dateApi().getSegmentGroupProps()}>
              <For each={dateApi().getSegments()}>
                {(segment) => <span {...dateApi().getSegmentProps({ segment })}>{segment.text}</span>}
              </For>
            </div>
          </div>
          <button aria-label="Open time picker" {...popoverApi().getTriggerProps()}>
            🕘
          </button>
        </div>
        <input {...dateApi().getHiddenInputProps()} />
      </div>
      <div {...popoverApi().getPositionerProps()}>
        <div class="wheel-picker-time-content" {...popoverApi().getContentProps()}>
          <div class="sr-only" {...popoverApi().getTitleProps()}>
            Select time
          </div>
          <div class="wheel-picker-group" role="group" aria-label="Time picker">
            <Picker
              label="Hour"
              collection={hourCollection}
              value={hour()}
              infinite
              onChange={(next) => {
                setHour(next)
                update(next)
              }}
            />
            <Picker
              label="Minute"
              collection={minuteCollection}
              value={minute()}
              infinite
              onChange={(next) => {
                setMinute(next)
                update(hour(), next)
              }}
            />
            <Picker
              label="Day period"
              collection={periodCollection}
              value={period()}
              onChange={(next) => {
                setPeriod(next)
                update(hour(), minute(), next)
              }}
            />
          </div>
        </div>
      </div>
      <output>Selected time: {dateApi().valueAsString[0] ?? "-"}</output>
    </main>
  )
}
