import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId, useMemo, useState } from "react"

export default function Page() {
  const [hideLeft, setHideLeft] = useState(false)
  const [hideRight, setHideRight] = useState(false)

  const panels = useMemo(
    () =>
      [
        !hideLeft && { id: "left", minSize: 20 },
        { id: "center", minSize: 30 },
        !hideRight && { id: "right", minSize: 20 },
      ].filter(Boolean) as splitter.PanelData[],
    [hideLeft, hideRight],
  )

  const service = useMachine(splitter.machine, {
    id: useId(),
    panels,
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <main className="splitter">
      <pre>{JSON.stringify(api.getSizes())}</pre>
      <button onClick={() => setHideLeft((value) => !value)}>{hideLeft ? "Show Left" : "Hide Left"}</button>
      <button onClick={() => setHideRight((value) => !value)}>{hideRight ? "Show Right" : "Hide Right"}</button>

      <div {...api.getRootProps()}>
        {!hideLeft && (
          <>
            <div {...api.getPanelProps({ id: "left" })}>
              <p>Left</p>
            </div>
            <div {...api.getResizeTriggerProps({ id: "left:center" })} />
          </>
        )}

        <div {...api.getPanelProps({ id: "center" })}>
          <p>Center</p>
        </div>

        {!hideRight && (
          <>
            <div {...api.getResizeTriggerProps({ id: "center:right" })} />
            <div {...api.getPanelProps({ id: "right" })}>
              <p>Right</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
