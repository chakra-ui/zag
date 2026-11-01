import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import "@styles/slider.css"
import "@styles/number-input.css"

const min = 0
const max = 1000

interface PriceInputProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function PriceInput(props: PriceInputProps) {
  const { label, value, min, max, onChange } = props
  const [draft, setDraft] = useState<string | null>(null)

  const service = useMachine(numberInput.machine, {
    id: useId(),
    value: draft ?? String(value),
    min,
    max,
    formatOptions: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
    onValueChange(details) {
      setDraft(details.value)
    },
    onValueCommit(details) {
      if (!Number.isNaN(details.valueAsNumber)) onChange(details.valueAsNumber)
      setDraft(null)
    },
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>
      <input {...api.getInputProps()} />
    </div>
  )
}

export default function Page() {
  const [value, setValue] = useState([200, 600])

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "price",
    min,
    max,
    step: 10,
    minStepsBetweenThumbs: 10,
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
    value,
    onValueChange(details) {
      setValue(details.value)
    },
  })

  const api = slider.connect(service, normalizeProps)

  const setThumb = (index: number) => (next: number) => api.setThumbValue(index, next)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Price</label>
        <output {...api.getValueTextProps()}>
          ${value[0]} – ${value[1]}
        </output>
        <div {...api.getControlProps()}>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          ))}
        </div>
        <PriceInput label="Min" value={value[0]} min={min} max={api.getThumbMax(0)} onChange={setThumb(0)} />
        <PriceInput label="Max" value={value[1]} min={api.getThumbMin(1)} max={max} onChange={setThumb(1)} />
      </div>
    </main>
  )
}
