"use client"

import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { timeRanges } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = useState<string | null>("week")

  const service = useMachine(radio.machine, {
    id: useId(),
    name: "range",
    orientation: "horizontal",
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = radio.connect(service, normalizeProps)
  const range = timeRanges.find((r) => r.id === value) ?? timeRanges[1]
  const max = Math.max(...range.bars)

  return (
    <>
      <main>
        <div className="segmented-control time-range">
          <p className="hint">Switch the range to redraw the chart, or jump to Year with the button.</p>
          <div {...api.getRootProps()}>
            <div {...api.getIndicatorProps()} />
            {timeRanges.map((opt) => (
              <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
                <input {...api.getItemHiddenInputProps({ value: opt.id })} />
              </label>
            ))}
          </div>
          <div className="chart" data-testid="chart">
            {range.bars.map((bar, i) => (
              <div key={i} className="bar" data-testid="bar" style={{ height: `${(bar / max) * 100}%` }} />
            ))}
          </div>
          <p className="caption" data-testid="caption" role="status">
            {range.caption}
          </p>
          <div className="actions">
            <button type="button" onClick={() => setValue("year")}>
              Jump to Year
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
