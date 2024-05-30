import * as numberInput from "@zag-js/number-input"
import { nan } from "@zag-js/number-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import { flushSync } from "react-dom"

interface Props {
  value: string
  onChange: (value: string) => void
  min: number
  max: number
}

function NumberInput(props: Props) {
  const { value, onChange, min, max } = props

  const [state, send] = useMachine(
    numberInput.machine({
      id: useId(),
      value,
    }),
    {
      context: {
        value,
        min,
        max,
        onValueChange(details) {
          flushSync(() => {
            onChange(details.value)
          })
        },
      },
    },
  )

  const api = numberInput.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()} style={{ display: "flex" }}>
        <span
          style={{
            fontSize: "12px",
            paddingInline: "4px",
            paddingBlock: "2.5px",
            border: "1px inset black",
          }}
        >
          USD
        </span>
        <input {...api.getInputProps()} />
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
  const [value, setValue] = useState([max / 4, max / 2])

  const [sliderState, sliderSend] = useMachine(
    slider.machine({
      id: useId(),
      name: "quantity",
      value,
      min,
      max,
      minStepsBetweenThumbs,
      thumbAlignment: "center",
      "aria-label": ["Minimum Price", "Maximum Price"],
    }),
    {
      context: {
        value: getAdjustedValue(value),
        onValueChange(details) {
          flushSync(() => {
            setValue(details.value)
          })
        },
      },
    },
  )

  const api = slider.connect(sliderState, sliderSend, normalizeProps)

  return (
    <main className="slider">
      <div {...api.getRootProps()}>
        <div>
          <output {...api.getValueTextProps()}>{api.value.join(" - ")}</output>
        </div>
        <div {...api.getControlProps()}>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px" }}>
        {value.map((v, i) => (
          <NumberInput
            key={i}
            value={v.toString()}
            min={api.getThumbMin(i)}
            max={api.getThumbMax(i)}
            onChange={(value) => {
              setValue((prev) => {
                const next = [...prev]
                next[i] = nan(parseFloat(value))
                return next
              })
            }}
          />
        ))}
      </div>
    </main>
  )
}
