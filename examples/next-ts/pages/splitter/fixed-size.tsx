import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"

export default function Page() {
  const service = useMachine(splitter.machine, {
    id: useId(),
    defaultSize: [50, 50],
    panels: [
      { id: "left", minSize: 20 },
      { id: "right", minSize: 20 },
    ],
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <main className="splitter">
      <pre>{JSON.stringify(api.getSizes())}</pre>
      <div {...api.getRootProps()}>
        <div {...api.getPanelProps({ id: "left" })}>
          <p>Left</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "left:" })} />
        <FixedSizeContent />
        <div {...api.getResizeTriggerProps({ id: ":right" })} />
        <div {...api.getPanelProps({ id: "right" })}>
          <p>Right</p>
        </div>
      </div>
    </main>
  )
}

function FixedSizeContent() {
  return (
    <div
      style={{
        flex: "0 0 180px",
        width: "180px",
        display: "grid",
        placeItems: "center",
        overflow: "auto",
        background: "#334155",
        color: "white",
        padding: "16px",
      }}
    >
      Fixed sized element
    </div>
  )
}
