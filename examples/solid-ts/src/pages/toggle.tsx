import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Toggle from "@ui-machines/toggle"
import { createMemo } from "solid-js"
import { toggleStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(toggleStyle)

export default function Page() {
  const [state, send] = useMachine(Toggle.machine.withContext({ label: "Toggle italic" }))

  const ref = useSetup<HTMLDivElement>({ send, id: "12" })
  const toggle = createMemo(() => Toggle.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div ref={ref}>
      <button className="toggle" {...toggle().buttonProps}>
        B
      </button>
      <StateVisualizer state={state} />
    </div>
  )
}
