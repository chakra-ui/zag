import * as numberInput from "@zag-js/number-input"
import * as slider from "@zag-js/slider"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { nan } from "@zag-js/utils"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/slider.css"
import "@styles/number-input.css"

interface Props {
  value: string
  onChange: (value: string) => void
  min: number
  max: number
}

function NumberInput(props: Props) {
  const id = createUniqueId()
  const service = useMachine(numberInput.machine, () => ({
    id,
    value: props.value,
    min: props.min,
    max: props.max,
    onValueChange(details) {
      props.onChange(details.value)
    },
  }))

  const api = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...mergeProps(api().getControlProps(), { style: { display: "flex" } })}>
        <span
          style={{
            "font-size": "12px",
            "padding-inline": "4px",
            "padding-block": "2.5px",
            border: "1px inset black",
          }}
        >
          USD
        </span>
        <input {...api().getInputProps()} />
      </div>
    </div>
  )
}

const min = 500
const max = 5000
const minStepsBetweenThumbs = 100

function getAdjustedValue(value: number[]) {
  let [start, end] = value

  const isOverflowing = start > end || end > max || start < min
  if (!isOverflowing) return value

  if (start > end || start < min) start = min
  if (end > max) end = max
  if (end < start) end = start + minStepsBetweenThumbs

  return [start, end]
}

export default function Page() {
  const [value, setValue] = createSignal([max / 4, max / 2])
  const id = createUniqueId()

  const service = useMachine(slider.machine, () => ({
    thumbSize: 20,
    id,
    name: "quantity",
    min,
    max,
    minStepsBetweenThumbs,
    thumbAlignment: "center" as const,
    "aria-label": ["Minimum Price", "Maximum Price"],
    value: getAdjustedValue(value()),
    onValueChange(details: slider.ValueChangeDetails) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main class="slider">
      <div {...api().getRootProps()}>
        <div>
          <output {...api().getValueTextProps()}>{api().value.join(" - ")}</output>
        </div>
        <div {...api().getControlProps()}>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <Index each={api().value}>{(_, index) => <div {...api().getThumbProps({ index })} />}</Index>
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px" }}>
        <Index each={value()}>
          {(v, i) => (
            <NumberInput
              value={v().toString()}
              min={api().getThumbMin(i)}
              max={api().getThumbMax(i)}
              onChange={(value) => {
                setValue((prev) => {
                  const next = [...prev]
                  next[i] = nan(parseFloat(value))
                  return next
                })
              }}
            />
          )}
        </Index>
      </div>
    </main>
  )
}
