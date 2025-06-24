import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { createMemo } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(toggle.machine)

  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <>
      <main class="toggle">
        <div {...api().getRootProps()}></div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
