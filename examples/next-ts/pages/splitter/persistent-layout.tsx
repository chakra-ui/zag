import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId, useMemo, useState } from "react"
import { usePersistentMapState } from "../../hooks/use-persistent-state"
import { isEqual } from "@zag-js/utils"

export default function Page() {
  const [showInspector, setShowInspector] = useState(true)

  const panels = useMemo(
    () =>
      [
        { id: "nav", minSize: 20 },
        { id: "content", minSize: 30 },
        showInspector && { id: "inspector", minSize: 20 },
      ].filter(Boolean) as splitter.PanelData[],
    [showInspector],
  )

  const [size, setSize, hydrated] = usePersistentMapState<number[]>({
    storageKey: "zag:splitter:persistent-layout",
    key: splitter.layout(panels),
    defaultValue: [],
  })

  const service = useMachine(splitter.machine, {
    id: useId(),
    panels,
    size,
    onResize: (details) => setSize(details.size),
  })

  const api = splitter.connect(service, normalizeProps)

  const machineSizes = api.getSizes()
  const ready = hydrated && (size.length === 0 || isEqual(machineSizes, size))

  return (
    <main className="splitter" style={{ visibility: ready ? "visible" : "hidden" }}>
      <pre>{JSON.stringify(api.getSizes())}</pre>
      <button onClick={() => setShowInspector((value) => !value)}>
        {showInspector ? "Hide Inspector" : "Show Inspector"}
      </button>

      <div {...api.getRootProps()}>
        <div {...api.getPanelProps({ id: "nav" })}>
          <p>Nav</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "nav:content" })} />
        <div {...api.getPanelProps({ id: "content" })}>
          <p>Content</p>
        </div>
        {showInspector && (
          <>
            <div {...api.getResizeTriggerProps({ id: "content:inspector" })} />
            <div {...api.getPanelProps({ id: "inspector" })}>
              <p>Inspector</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
