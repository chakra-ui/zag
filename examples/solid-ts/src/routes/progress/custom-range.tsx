import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/progress.css"

export default function Page() {
  const service = useMachine(progress.machine, {
    id: createUniqueId(),
    min: -20,
    max: 40,
    defaultValue: 10,
    formatOptions: { style: "unit", unit: "celsius" },
  })

  const api = createMemo(() => progress.connect(service, normalizeProps))

  const syncService = useMachine(progress.machine, { id: createUniqueId(), defaultValue: 60 })
  const sync = createMemo(() => progress.connect(syncService, normalizeProps))

  return (
    <main class="progress">
      <div class="vstack gap-4">
        <div {...api().getRootProps()}>
          <div class="progress-header">
            <span {...api().getLabelProps()}>Temperature</span>
            <span {...api().getValueTextProps()}>{api().valueAsString}</span>
          </div>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
        </div>

        <div class="hstack">
          <button onClick={() => api().setValue(-30)}>Set -30</button>
          <button onClick={() => api().setValue(25)}>Set 25</button>
          <button onClick={() => api().setValue(50)}>Set 50</button>
        </div>

        <div {...sync().getRootProps()}>
          <div {...sync().getTrackProps()} aria-label="Syncing">
            <div {...sync().getRangeProps()} />
          </div>
        </div>
      </div>
    </main>
  )
}
