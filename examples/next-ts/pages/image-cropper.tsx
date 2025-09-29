import * as imageCropper from "@zag-js/image-cropper"
import { useMachine, normalizeProps } from "@zag-js/react"
// import { imageCropperControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { handlePositions } from "@zag-js/shared"
// import { useControls } from "../hooks/use-controls"

export default function Page() {
  // const controls = useControls(imageCropperControls)

  const service = useMachine(imageCropper.machine, {
    id: useId(),
    // ...controls.context,
  })

  const api = imageCropper.connect(service, normalizeProps)

  return (
    <>
      <main className="image-cropper">
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <img src="https://picsum.photos/seed/a/500/300" {...api.getImageProps()} />
            <div {...api.getSelectionProps()}>
              <div {...api.getOverlayProps()} />
              {handlePositions.map((position) => (
                <div key={position} {...api.getHandleProps({ position })} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* <Toolbar controls={controls.ui}> */}
      <Toolbar>
        <StateVisualizer
          state={service}
          context={["naturalSize", "bounds", "crop", "pointerStart", "cropStart", "handlePosition"]}
        />
      </Toolbar>
    </>
  )
}
