import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import "@styles/progress.css"

export default function Page() {
  const service = useMachine(progress.machine, {
    id: useId(),
    min: -20,
    max: 40,
    defaultValue: 10,
    formatOptions: { style: "unit", unit: "celsius" },
  })

  const api = progress.connect(service, normalizeProps)

  const syncService = useMachine(progress.machine, { id: useId(), defaultValue: 60 })
  const sync = progress.connect(syncService, normalizeProps)

  return (
    <main className="progress">
      <div className="vstack gap-4">
        <div {...api.getRootProps()}>
          <div className="progress-header">
            <span {...api.getLabelProps()}>Temperature</span>
            <span {...api.getValueTextProps()}>{api.valueAsString}</span>
          </div>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
        </div>

        <div className="hstack">
          <button onClick={() => api.setValue(-30)}>Set -30</button>
          <button onClick={() => api.setValue(25)}>Set 25</button>
          <button onClick={() => api.setValue(50)}>Set 50</button>
        </div>

        <div {...sync.getRootProps()}>
          <div {...sync.getTrackProps()} aria-label="Syncing">
            <div {...sync.getRangeProps()} />
          </div>
        </div>
      </div>
    </main>
  )
}
