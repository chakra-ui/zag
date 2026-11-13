import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/meter.css"

export default function Page() {
  const service = useMachine(meter.machine, {
    id: createUniqueId(),
    min: -20,
    max: 40,
    low: 0,
    high: 25,
    optimum: 18,
    defaultValue: 10,
    formatOptions: { style: "unit", unit: "celsius" },
  })

  const api = createMemo(() => meter.connect(service, normalizeProps))

  const diskService = useMachine(meter.machine, { id: createUniqueId(), defaultValue: 30 })
  const disk = createMemo(() => meter.connect(diskService, normalizeProps))

  return (
    <main class="meter">
      <div {...api().getRootProps()}>
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "baseline" }}>
          <span {...api().getLabelProps()}>Temperature</span>
          <span {...api().getValueTextProps()}>
            {api().valueAsString} · {api().percentAsString}
          </span>
        </div>
        <div {...api().getTrackProps()}>
          <div {...api().getIndicatorProps()} />
        </div>
      </div>

      <div class="meter-actions">
        <button type="button" onClick={() => api().setValue(-30)}>
          Set -30
        </button>
        <button type="button" onClick={() => api().setValue(18)}>
          Set 18
        </button>
        <button type="button" onClick={() => api().setValue(50)}>
          Set 50
        </button>
      </div>

      <div {...disk().getRootProps()} aria-label="Disk usage">
        <div {...disk().getTrackProps()}>
          <div {...disk().getIndicatorProps()} />
        </div>
      </div>
    </main>
  )
}
