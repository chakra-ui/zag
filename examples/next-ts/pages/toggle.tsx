import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    toggle.machine({
      id: useId(),
      "aria-label": "Toggle italic",
    }),
  )

  const { buttonProps } = toggle.connect(state, send, normalizeProps)

  return (
    <>
      <main className="toggle">
        <button {...buttonProps}>B</button>
      </main>
      <Toolbar viz controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
