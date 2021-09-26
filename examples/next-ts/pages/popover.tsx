import { popover } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { popoverStyle } from "../../../shared/style"

const Styles = styled(`div`)(popoverStyle)

export default function Page() {
  const [state, send] = useMachine(
    popover.machine.withContext({
      autoFocus: true,
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { triggerProps, popoverProps } = popover.connect(state, send)

  return (
    <Styles>
      <div style={{ width: "300px" }} ref={ref}>
        <button {...triggerProps}>Click me</button>
        <div {...popoverProps}>
          <div>Popover content</div>
          <div>
            <input placeholder="hello" />
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </Styles>
  )
}
