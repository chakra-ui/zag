import * as meter from "@zag-js/meter"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(meter.machine, { id: useId(), defaultValue: 50, low: 30, high: 70 })

  const api = meter.connect(service, normalizeProps)

  return (
    <main className="meter">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Battery</label>
        <div
          {...api.getTrackProps()}
          style={{ width: "200px", height: "20px", background: "#eee", position: "relative" }}
        >
          <div
            {...api.getIndicatorProps()}
            style={{
              background: api.valueState === "low" ? "red" : api.valueState === "high" ? "orange" : "green",
              height: "100%",
            }}
          />
        </div>
        <div {...api.getValueTextProps()}>
          {api.valueAsString} - {api.valueState}
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button data-testid="set-20" onClick={() => api.setValue(20)}>
          Set 20
        </button>
        <button data-testid="set-75" onClick={() => api.setValue(75)}>
          Set 75
        </button>
        <button data-testid="set-80" onClick={() => api.setValue(80)}>
          Set 80
        </button>
      </div>
    </main>
  )
}
