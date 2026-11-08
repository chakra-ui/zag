"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId } from "react"
import "@styles/color-picker.css"

const swatches = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#64748b"]

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    defaultValue: colorPicker.parse("#22c55e"),
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <main className="color-picker">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Label color: <span {...api.getValueTextProps()}>{api.valueAsString}</span>
        </label>

        <div {...api.getSwatchGroupProps()} className="color-picker-swatches">
          {swatches.map((swatch) => (
            <button
              key={swatch}
              {...api.getSwatchTriggerProps({ value: swatch })}
              className="color-picker-swatch-button"
            >
              <div {...api.getSwatchProps({ value: swatch })} />
              <span {...api.getSwatchIndicatorProps({ value: swatch })}>
                <CheckIcon size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
