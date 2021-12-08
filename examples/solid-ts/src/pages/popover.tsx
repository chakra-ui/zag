import { css } from "@emotion/css"
import * as Popover from "@ui-machines/popover"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { popoverStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(popoverStyle)

export default function Page() {
  const [state, send] = useMachine(
    Popover.machine.withContext({
      autoFocus: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const popover = createMemo(() => Popover.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <div style={{ width: "300px" }} ref={ref}>
        <button {...popover().triggerProps}>Click me</button>
        <div {...popover().contentProps}>
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
