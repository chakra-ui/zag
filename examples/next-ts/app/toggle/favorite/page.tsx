"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { HeartIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/toggle.css"

export default function Page() {
  const [saved, setSaved] = useState(false)

  const service = useMachine(toggle.machine, {
    id: useId(),
    pressed: saved,
    onPressedChange: setSaved,
  })
  const api = toggle.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="toggle-favorite">
          <p className="hint">Save the recipe, then use Reset to clear it from outside.</p>
          <div className="row">
            <button aria-label="Save recipe" {...api.getRootProps()}>
              <span {...api.getIndicatorProps()}>
                <HeartIcon className="icon" />
              </span>
            </button>
            <span className="count" data-testid="saved-count">
              Saved by {saved ? 129 : 128} people
            </span>
          </div>
          <button type="button" onClick={() => setSaved(false)}>
            Reset
          </button>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
