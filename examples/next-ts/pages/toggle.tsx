import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@zag-js/react"
import * as Toggle from "@zag-js/toggle"
import { useId } from "react"
import { toggleStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(Toggle.machine.withContext({ label: "Toggle italic" }))

  const ref = useSetup({ send, id: useId() })

  const { buttonProps } = Toggle.connect(state, send)

  return (
    <div ref={ref}>
      <Global styles={toggleStyle} />
      <button className="toggle" {...buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </div>
  )
}
