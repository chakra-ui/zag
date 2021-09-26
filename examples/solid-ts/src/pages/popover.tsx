import { popover } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { popoverStyle } from "../../../../shared/style"

const styles = css(popoverStyle)

export default function Page() {
  const [state, send] = useMachine(
    popover.machine.withContext({
      autoFocus: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "popover" })

  const machineState = createMemo(() => popover.connect(state, send, normalizeProps))

  return (
    <div className={styles}>
      <div style={{ width: "300px" }} ref={ref}>
        <button {...machineState().triggerProps}>Click me</button>
        <div {...machineState().popoverProps}>
          <div>Popover content</div>
          <div>
            <input placeholder="hello" />
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
