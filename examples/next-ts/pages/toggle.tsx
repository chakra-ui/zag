import { Global } from "@emotion/react"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { useId } from "react"
import { toggleStyle } from "@zag-js/shared"
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
      <Global styles={toggleStyle} />
      <button className="toggle" {...buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </main>
  )
}
