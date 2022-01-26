import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Toggle from "@ui-machines/toggle"
import { StateVisualizer } from "components/state-visualizer"
import { toggleStyle } from "../../../shared/style"

export default function Page() {
  const [state, send] = useMachine(Toggle.machine.withContext({ label: "Toggle italic" }))

  const ref = useSetup<HTMLDivElement>({ send, id: "12" })
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
