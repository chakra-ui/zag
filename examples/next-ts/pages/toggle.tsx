import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    toggle.machine({
      id: useId(),
      label: "toggle italic",
    }),
  )

  const { buttonProps } = toggle.connect(state, send, normalizeProps)

  return (
    <main>
      <button className="toggle" {...buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </main>
  )
}
