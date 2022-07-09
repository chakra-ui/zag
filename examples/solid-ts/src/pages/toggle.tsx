import { injectGlobal } from "@emotion/css"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { createMemo, createUniqueId } from "solid-js"
import { toggleStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(toggleStyle)

export default function Page() {
  const [state, send] = useMachine(toggle.machine({ id: createUniqueId(), label: "toggle italic" }))

  const api = createMemo(() => toggle.connect(state, send, normalizeProps))

  return (
    <div>
      <button class="toggle" {...api().buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </div>
  )
}
