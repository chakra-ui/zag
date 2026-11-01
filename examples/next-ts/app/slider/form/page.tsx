"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import { Output } from "@/components/output"
import "@styles/slider.css"

const minBudget = 50

export default function Page() {
  const [invalid, setInvalid] = useState(false)
  const [submitted, setSubmitted] = useState<Record<string, FormDataEntryValue> | null>(null)

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "budget",
    defaultValue: [20],
    thumbSize: 20,
    invalid,
    onValueChange() {
      setInvalid(false)
    },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <form
        className="vstack gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          const data = Object.fromEntries(new FormData(event.currentTarget))
          if (Number(data.budget) < minBudget) return setInvalid(true)
          setSubmitted(data)
        }}
        onReset={() => {
          setInvalid(false)
          setSubmitted(null)
        }}
      >
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Budget</label>
          <output {...api.getValueTextProps()}>${api.value[0]}</output>
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
        </div>
        {invalid && <p className="slider-error">Budget must be at least ${minBudget}</p>}
        <div className="hstack">
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <Output label="Submitted" value={submitted ?? "—"} />
    </main>
  )
}
