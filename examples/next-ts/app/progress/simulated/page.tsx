"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useState } from "react"
import "@styles/progress.css"

export default function Page() {
  const [running, setRunning] = useState(false)

  const service = useMachine(progress.machine, {
    id: useId(),
    defaultValue: 0,
  })

  const api = progress.connect(service, normalizeProps)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const next = Math.min(100, (service.context.get("value") ?? 0) + Math.ceil(Math.random() * 12))
      api.setValue(next)
      if (next === 100) setRunning(false)
    }, 300)
    return () => clearInterval(id)
  }, [running])

  return (
    <main className="progress">
      <div className="vstack gap-4">
        <div {...api.getRootProps()}>
          <div className="progress-header">
            <span {...api.getLabelProps()}>report.pdf</span>
            <span {...api.getValueTextProps()}>{api.valueAsString}</span>
          </div>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          <span {...api.getViewProps({ state: "loading" })}>Uploading…</span>
          <span {...api.getViewProps({ state: "complete" })}>Upload complete</span>
        </div>

        <div className="hstack">
          <button
            disabled={running}
            onClick={() => {
              api.setValue(0)
              setRunning(true)
            }}
          >
            {api.value === 100 ? "Upload again" : "Start upload"}
          </button>
        </div>
      </div>
    </main>
  )
}
