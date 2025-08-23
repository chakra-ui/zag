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
        <div {...api().getHeaderProps()}></div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
