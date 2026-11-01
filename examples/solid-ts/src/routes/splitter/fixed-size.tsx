import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/splitter.css"

export default function Page() {
  const service = useMachine(splitter.machine, {
    id: createUniqueId(),
    defaultSize: [50, 50],
    panels: [
      { id: "left", minSize: 20 },
      { id: "right", minSize: 20 },
    ],
  })

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <main class="splitter">
      <pre>{JSON.stringify(api().getSizes())}</pre>
      <div {...api().getRootProps()}>
        <div {...api().getPanelProps({ id: "left" })}>
          <p>Left</p>
        </div>
        <div {...api().getResizeTriggerProps({ id: "left:" })} />
        <FixedSizeContent />
        <div {...api().getResizeTriggerProps({ id: ":right" })} />
        <div {...api().getPanelProps({ id: "right" })}>
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
        "place-items": "center",
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
