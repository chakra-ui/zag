import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
// import { useControls } from "../hooks/use-controls"

export default function Page() {
  // const controls = useControls(imageCropperControls)

  const service = useMachine(imageCropper.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => imageCropper.connect(service, normalizeProps))

  return (
    <>
      <main class="image-cropper">
        <div {...api().getRootProps()}></div>
      </main>

      {/* <Toolbar controls={controls.ui}> */}
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
