import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Splitter from "@ui-machines/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { splitterControls } from "../../../../shared/controls"
import { splitterStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(splitterStyle)

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(Splitter.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const splitter = createMemo(() => Splitter.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="root">
        <div ref={ref} {...splitter().rootProps}>
          <div className="pane" {...splitter().primaryPaneProps}>
            <div>
              <small {...splitter().labelProps}>Table of Contents</small>
              <p>Primary Pane</p>
            </div>
          </div>
          <div className="splitter" {...splitter().splitterProps}>
            <div className="splitter-bar" />
          </div>
          <div className="pane" {...splitter().secondaryPaneProps}>
            Secondary Pane
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
