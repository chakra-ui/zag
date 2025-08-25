import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/react"
import { bottomSheetControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(bottomSheetControls)

  const service = useMachine(bottomSheet.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = bottomSheet.connect(service, normalizeProps)

  return (
    <>
      <main className="bottom-sheet">
        <button {...api.getTriggerProps()}>Open</button>
        <div {...api.getBackdropProps()} />
        <div {...api.getContentProps()}>
          <div {...api.getGrabberProps()}>
            <div {...api.getGrabberIndicatorProps()} />
          </div>
          <div>Bottom Sheet</div>
          <div data-no-drag>No drag area</div>
          <div className="scrollable">
            {Array.from({ length: 100 }).map((_element, index) => (
              <div key={index}>Item {index}</div>
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
