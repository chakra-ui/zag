import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { meterControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(meterControls)

  const service = useMachine(meter.machine, {
    id: useId(),
    defaultValue: 50,
    low: 30,
    high: 70,
    ...controls.context,
  })

  const api = meter.connect(service, normalizeProps)

  return (
    <>
      <main className="meter">
        <div {...api.getRootProps()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label {...api.getLabelProps()}>Battery</label>
            <div {...api.getValueTextProps()}>
              {api.valueAsString} &middot; {api.valueState}
            </div>
          </div>
          <div {...api.getTrackProps()}>
            <div {...api.getIndicatorProps()} />
          </div>
        </div>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[20, 40, 60, 80, 100].map((v) => (
              <button key={v} onClick={() => api.setValue(v)}>
                Set {v}%
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label htmlFor="value-slider" style={{ fontSize: "14px", fontWeight: "500" }}>
              Custom Value:
            </label>
            <input
              id="value-slider"
              max="100"
              min="0"
              onChange={(e) => api.setValue(Number(e.target.value))}
              style={{ flex: "1" }}
              type="range"
              value={api.value}
            />
            <span style={{ fontSize: "14px", fontWeight: "600", width: "3ch" }}>{api.value}%</span>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
