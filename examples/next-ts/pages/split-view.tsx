import { splitView } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { splitViewStyle } from "../../../shared/style"

const Styles = styled(`div`)(splitViewStyle)

export default function Page() {
  const [state, send] = useMachine(splitView.machine.withContext({ min: 0 }))

  const ref = useMount<HTMLDivElement>(send)

  const { rootProps, splitterProps, primaryPaneProps, secondaryPaneProps, labelProps } = splitView.connect(state, send)

  return (
    <Styles>
      <div className="root">
        <div ref={ref} {...rootProps}>
          <div className="pane" {...primaryPaneProps}>
            <div>
              <small {...labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div className="splitter" {...splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div className="pane" {...secondaryPaneProps}>
            Secondary Pane
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </Styles>
  )
}
