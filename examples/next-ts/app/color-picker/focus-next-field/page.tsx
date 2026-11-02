"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import "@styles/color-picker.css"

const presets = ["#f47373", "#697689", "#37d67a"]

export default function Page() {
  const nextFieldRef = useRef<HTMLInputElement>(null)
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    closeOnSelect: true,
    defaultValue: colorPicker.parse("#ff0000"),
    onValueChange() {
      nextFieldRef.current?.focus()
    },
  })
  const api = colorPicker.connect(service, normalizeProps)
  return (
    <main className="color-picker">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <div {...api.getSwatchProps({ value: api.value })} />
          </button>
        </div>
        <input ref={nextFieldRef} data-testid="next-field" placeholder="Next field" />
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getSwatchGroupProps()} style={{ display: "flex", gap: 8 }}>
              {presets.map((preset) => (
                <button key={preset} {...api.getSwatchTriggerProps({ value: preset })}>
                  <div {...api.getSwatchProps({ value: preset })} style={{ width: 20, height: 20 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
