import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    toggle.machine({
      id: createUniqueId(),
      "aria-label": "Toggle italic",
    }),
  )

  const api = createMemo(() => toggle.connect(state, send, normalizeProps))

  return (
    <>
      <main class="toggle">
        <button {...api().buttonProps}>B</button>
      </main>
      <StateVisualizer state={state} />
    </>
  )
}
