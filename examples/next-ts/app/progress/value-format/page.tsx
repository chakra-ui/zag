"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/progress.css"

export default function Page() {
  const service = useMachine(progress.machine, {
    id: useId(),
    max: 12,
    defaultValue: 4,
    translations: {
      value: ({ value, max }) => (value == null ? "Preparing…" : `${value} of ${max} files`),
    },
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <main className="progress">
      <div className="vstack gap-4">
        <div {...api.getRootProps()}>
          <div className="progress-header">
            <span {...api.getLabelProps()}>Copying files</span>
            <span {...api.getValueTextProps()}>{api.valueAsString}</span>
          </div>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
        </div>

        <div className="hstack">
          <button onClick={() => api.setValue(Math.max(0, (api.value ?? 0) - 1))}>Previous</button>
          <button onClick={() => api.setValue(Math.min(api.max, (api.value ?? 0) + 1))}>Next file</button>
        </div>
      </div>
    </main>
  )
}
