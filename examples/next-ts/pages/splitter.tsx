import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Splitter from "@ui-machines/splitter"
import { splitterControls } from "../../../shared/controls"
import { splitterStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(Splitter.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { rootProps, splitterProps, primaryPaneProps, secondaryPaneProps, labelProps } = Splitter.connect(state, send)

  return (
    <>
      <Global styles={splitterStyle} />
      <controls.ui />

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
    </>
  )
}
