import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import * as Toggle from "@zag-js/toggle"
import { createMemo } from "solid-js"
import { toggleStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(toggleStyle)

export default function Page() {
  const [state, send] = useMachine(Toggle.machine.withContext({ label: "Toggle italic" }))

  const ref = useSetup({ send, id: "12" })
  const toggle = createMemo(() => Toggle.connect<PropTypes>(state, send, normalizeProps))

  return (
    <div ref={ref}>
      <button className="toggle" {...toggle().buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </div>
  )
}
