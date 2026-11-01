"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/progress.css"

export default function Page() {
  const service = useMachine(progress.machine, {
    id: useId(),
    defaultValue: 40,
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <>
      <main className="progress">
        <div className="vstack gap-4">
          <div {...api.getRootProps()}>
            <span {...api.getLabelProps()}>Syncing</span>
            <div className="progress-circle-wrap">
              <svg {...api.getCircleProps()}>
                <circle {...api.getCircleTrackProps()} />
                <circle {...api.getCircleRangeProps()} />
              </svg>
              <span {...api.getValueTextProps()}>{api.percentAsString}</span>
            </div>
          </div>

          <div className="hstack">
            <button onClick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
            <button onClick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
