"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/progress.css"

// `null` means the amount of work is unknown
function Linear() {
  const service = useMachine(progress.machine, { id: useId(), defaultValue: null })
  const api = progress.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Loading files</span>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()} />
      </div>
    </div>
  )
}

function Circular() {
  const service = useMachine(progress.machine, { id: useId(), defaultValue: null })
  const api = progress.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Connecting</span>
      <svg {...api.getCircleProps()}>
        <circle {...api.getCircleTrackProps()} />
        <circle {...api.getCircleRangeProps()} />
      </svg>
    </div>
  )
}

export default function Page() {
  return (
    <main className="progress">
      <div className="vstack gap-8">
        <Linear />
        <Circular />
      </div>
    </main>
  )
}
