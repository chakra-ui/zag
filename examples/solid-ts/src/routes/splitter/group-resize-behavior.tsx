import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/splitter.css"

export default function Page() {
  const service = useMachine(splitter.machine, {
    id: createUniqueId(),
    defaultSize: ["250px", "70%"],
    panels: [
      { id: "left", minSize: "125px", resizeBehavior: "preserve-pixel-size" },
      { id: "right", minSize: "125px" },
    ],
  })

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <main class="splitter">
      <pre>{JSON.stringify(api().getSizes())}</pre>
      <div {...api().getRootProps()}>
        <div {...api().getPanelProps({ id: "left" })}>
          <p>Left: preserves pixel size on group resize</p>
        </div>
        <div {...api().getResizeTriggerProps({ id: "left:right" })} />
        <div {...api().getPanelProps({ id: "right" })}>
          <p>Right: absorbs group resize</p>
        </div>
      </div>
    </main>
  )
}
