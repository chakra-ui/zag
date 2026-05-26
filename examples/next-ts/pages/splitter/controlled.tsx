import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId, useState } from "react"

export default function Page() {
  const [size, setSize] = useState<number[]>([25, 50, 25])

  const service = useMachine(splitter.machine, {
    id: useId(),
    panels: [
      { id: "left", minSize: 15 },
      { id: "center", minSize: 20 },
      { id: "right", minSize: 15 },
    ],
    size,
    onResize: (details) => setSize(details.size),
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <main className="splitter">
      <pre>{JSON.stringify(size)}</pre>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setSize([25, 50, 25])}>Reset</button>
        <button onClick={() => setSize([50, 25, 25])}>Left wide</button>
        <button onClick={() => setSize([25, 25, 50])}>Right wide</button>
        <button onClick={() => setSize([15, 70, 15])}>Center wide</button>
      </div>

      <div {...api.getRootProps()}>
        <div {...api.getPanelProps({ id: "left" })}>
          <p>Left</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "left:center" })} />
        <div {...api.getPanelProps({ id: "center" })}>
          <p>Center</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "center:right" })} />
        <div {...api.getPanelProps({ id: "right" })}>
          <p>Right</p>
        </div>
      </div>
    </main>
  )
}
