import { useMachine } from "@ui-machines/react"
import { popover } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import styled from "@emotion/styled"

const Styles = styled(`div`)`
  [role="dialog"] {
    background: red;
    padding: 20px;
  }

  [role="dialog"]:focus {
    outline: 2px solid royalblue;
  }
`

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
      <div style={{ width: 300 }} ref={ref}>
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
