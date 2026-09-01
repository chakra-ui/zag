"use client"

import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { meterControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/meter.css"

export default function Page() {
  const controls = useControls(meterControls)

  const service = useMachine(meter.machine, {
    id: useId(),
    defaultValue: 40,
    low: 20,
    high: 80,
    optimum: 90,
    ...controls.context,
  })

  const api = meter.connect(service, normalizeProps)

  return (
    <>
      <main className="meter">
        <div {...api.getRootProps()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span {...api.getLabelProps()}>Battery</span>
            <span {...api.getValueTextProps()}>
              {api.valueAsString} · {api.valueState}
            </span>
          </div>
          <div {...api.getTrackProps()}>
            <div {...api.getIndicatorProps()} />
          </div>
        </div>

        <p>
          Optimum is above <code>high</code>, so a larger value is better. 90 is optimal, 50 is suboptimal, 10 is
          least-optimal.
        </p>

        <div className="meter-actions">
          {[
            { value: 10, label: "10%" },
            { value: 50, label: "50%" },
            { value: 90, label: "90%" },
          ].map(({ value, label }) => (
            <button key={value} data-testid={`set-${value}`} type="button" onClick={() => api.setValue(value)}>
              Set {label}
            </button>
          ))}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
