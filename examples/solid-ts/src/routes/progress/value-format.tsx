import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/progress.css"

export default function Page() {
  const service = useMachine(progress.machine, {
    id: createUniqueId(),
    max: 12,
    defaultValue: 4,
    translations: {
      value: ({ value, max }) => (value == null ? "Preparing…" : `${value} of ${max} files`),
    },
  })

  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <main class="progress">
      <div class="vstack gap-4">
        <div {...api().getRootProps()}>
          <div class="progress-header">
            <span {...api().getLabelProps()}>Copying files</span>
            <span {...api().getValueTextProps()}>{api().valueAsString}</span>
          </div>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
        </div>

        <div class="hstack">
          <button onClick={() => api().setValue(Math.max(0, (api().value ?? 0) - 1))}>Previous</button>
          <button onClick={() => api().setValue(Math.min(api().max, (api().value ?? 0) + 1))}>Next file</button>
        </div>
      </div>
    </main>
  )
}
