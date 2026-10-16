import * as numberInput from "@zag-js/number-input"
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
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
  const [draft, setDraft] = createSignal<string | null>(null)

  const id = createUniqueId()
  const service = useMachine(numberInput.machine, () => ({
    id,
    value: draft() ?? String(props.value),
    min: props.min,
    max: props.max,
    formatOptions: { style: "currency" as const, currency: "USD", maximumFractionDigits: 0 },
    onValueChange(details: numberInput.ValueChangeDetails) {
      setDraft(details.value)
    },
    onValueCommit(details: numberInput.ValueChangeDetails) {
      if (!Number.isNaN(details.valueAsNumber)) props.onChange(details.valueAsNumber)
      setDraft(null)
    },
  }))

  const api = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>{props.label}</label>
      <input {...api().getInputProps()} />
    </div>
  )
}

export default function Page() {
  const [value, setValue] = createSignal([200, 600])

  const id = createUniqueId()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "price",
    min,
    max,
    step: 10,
    minStepsBetweenThumbs: 10,
    thumbSize: 20,
    "aria-label": ["Minimum price", "Maximum price"],
    value: value(),
    onValueChange(details: slider.ValueChangeDetails) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  const setThumb = (index: number) => (next: number) => api().setThumbValue(index, next)

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Price</label>
        <output {...api().getValueTextProps()}>
          ${value()[0]} – ${value()[1]}
        </output>
        <div {...api().getControlProps()}>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <Index each={api().value}>
            {(_, index) => (
              <div {...api().getThumbProps({ index })}>
                <input {...api().getHiddenInputProps({ index })} />
              </div>
            )}
          </Index>
        </div>
        <PriceInput label="Min" value={value()[0]} min={min} max={api().getThumbMax(0)} onChange={setThumb(0)} />
        <PriceInput label="Max" value={value()[1]} min={api().getThumbMin(1)} max={max} onChange={setThumb(1)} />
      </div>
    </main>
  )
}
