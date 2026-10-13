import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createEffect, createMemo, createSignal, createUniqueId, onCleanup } from "solid-js"
import "@styles/progress.css"

export default function Page() {
  const [running, setRunning] = createSignal(false)

  const service = useMachine(progress.machine, {
    id: createUniqueId(),
    defaultValue: 0,
  })

  const api = createMemo(() => progress.connect(service, normalizeProps))

  createEffect(() => {
    if (!running()) return
    const id = setInterval(() => {
      const next = Math.min(100, (service.context.get("value") ?? 0) + Math.ceil(Math.random() * 12))
      api().setValue(next)
      if (next === 100) setRunning(false)
    }, 300)
    onCleanup(() => clearInterval(id))
  })

  return (
    <main class="progress">
      <div class="vstack gap-4">
        <div {...api().getRootProps()}>
          <div class="progress-header">
            <span {...api().getLabelProps()}>report.pdf</span>
            <span {...api().getValueTextProps()}>{api().valueAsString}</span>
          </div>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <span {...api().getViewProps({ state: "loading" })}>Uploading…</span>
          <span {...api().getViewProps({ state: "complete" })}>Upload complete</span>
        </div>

        <div class="hstack">
          <button
            disabled={running()}
            onClick={() => {
              api().setValue(0)
              setRunning(true)
            }}
          >
            {api().value === 100 ? "Upload again" : "Start upload"}
          </button>
        </div>
      </div>
    </main>
  )
}
