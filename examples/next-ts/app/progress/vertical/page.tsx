"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/progress.css"

const levels = [
  { label: "CPU", value: 72 },
  { label: "RAM", value: 45 },
  { label: "Disk", value: 90 },
]

function Level(props: { label: string; value: number }) {
  const service = useMachine(progress.machine, {
    id: useId(),
    orientation: "vertical",
    defaultValue: props.value,
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <span {...api.getValueTextProps()}>{api.valueAsString}</span>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()} />
      </div>
      <span {...api.getLabelProps()}>{props.label}</span>
    </div>
  )
}

export default function Page() {
  return (
    <main className="progress">
      <div className="hstack gap-8">
        {levels.map((level) => (
          <Level key={level.label} {...level} />
        ))}
      </div>
    </main>
  )
}
