"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/color-picker.css"

const errorId = "color-error"

function Picker(props: { label: string; api: colorPicker.Api }) {
  const { label, api } = props
  const { invalid } = api.getRootState()
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>

      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <div {...api.getTransparencyGridProps({ size: "10px" })} />
          <div {...api.getSwatchProps({ value: api.value })} />
        </button>
        <input {...api.getChannelInputProps({ channel: "hex" })} aria-describedby={invalid ? errorId : undefined} />
      </div>

      {invalid && (
        <p id={errorId} className="color-picker-error">
          Pick a color with enough contrast
        </p>
      )}

      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div className="content__inner">
            <div {...api.getAreaProps()}>
              <div {...api.getAreaBackgroundProps()} />
              <div {...api.getAreaThumbProps()} />
            </div>

            <div {...api.getChannelSliderProps({ channel: "hue" })}>
              <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
              <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [invalid, setInvalid] = useState(true)

  const disabledService = useMachine(colorPicker.machine, {
    id: useId(),
    disabled: true,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const readOnlyService = useMachine(colorPicker.machine, {
    id: useId(),
    readOnly: true,
    defaultValue: colorPicker.parse("#22c55e"),
  })

  const invalidService = useMachine(colorPicker.machine, {
    id: useId(),
    invalid,
    defaultValue: colorPicker.parse("#eab308"),
  })

  return (
    <main className="color-picker">
      <div className="color-picker-row">
        <Picker label="Disabled" api={colorPicker.connect(disabledService, normalizeProps)} />
        <Picker label="Read-only" api={colorPicker.connect(readOnlyService, normalizeProps)} />
        <Picker label="Invalid" api={colorPicker.connect(invalidService, normalizeProps)} />
      </div>

      <label>
        <input type="checkbox" checked={invalid} onChange={(event) => setInvalid(event.currentTarget.checked)} /> Mark
        as invalid
      </label>
    </main>
  )
}
