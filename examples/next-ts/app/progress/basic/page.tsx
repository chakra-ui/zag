"use client"

import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { progressControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/progress.css"

export default function Page() {
  const controls = useControls(progressControls)

  const service = useMachine(progress.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <>
      <main className="progress">
        <div className="vstack gap-4">
          <div {...api.getRootProps()}>
            <div className="progress-header">
              <span {...api.getLabelProps()}>Upload progress</span>
              <span {...api.getValueTextProps()}>{api.valueAsString}</span>
            </div>
            <div {...api.getTrackProps()}>
              <div {...api.getRangeProps()} />
            </div>
          </div>

          <div className="hstack">
            <button onClick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
            <button onClick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
            <button onClick={() => api.setValue(null)}>Indeterminate</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
