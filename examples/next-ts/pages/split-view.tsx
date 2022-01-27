import styled from "@emotion/styled"
import { useMachine, useSetup } from "@ui-machines/react"
import * as SplitView from "@ui-machines/split-view"
import { splitViewStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const Styles = styled.div(splitViewStyle)

export default function Page() {
  const [state, send] = useMachine(SplitView.machine.withContext({ min: 0 }))

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { rootProps, splitterProps, primaryPaneProps, secondaryPaneProps, labelProps } = SplitView.connect(state, send)

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
