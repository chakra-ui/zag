import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { bottomSheetControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(bottomSheetControls)

  const service = useMachine(
    bottomSheet.machine,
    controls.mergeProps({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => bottomSheet.connect(service, normalizeProps))

  return (
    <>
      <main class="bottom-sheet">
        <button {...api().getTriggerProps()}>Open</button>
        <div {...api().getBackdropProps()} />
        <div {...api().getContentProps()}>
          <div {...api().getGrabberProps()}>
            <div {...api().getGrabberIndicatorProps()} />
          </div>
          <div>Bottom Sheet</div>
          <div data-no-drag="true">No drag area</div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
