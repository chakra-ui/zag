import * as sheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { bottomSheetControls, bottomSheetData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(bottomSheetControls)

  const service = useMachine(sheet.machine, {
    id: createUniqueId(),
    ...controls.context,
  })

  const api = createMemo(() => sheet.connect(service, normalizeProps))

  return (
    <>
      <main class="bottom-sheet">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
