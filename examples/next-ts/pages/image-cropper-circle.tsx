import * as imageCropper from "@zag-js/image-cropper"
import { useMachine, normalizeProps } from "@zag-js/react"
import { imageCropperControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { handlePositions } from "@zag-js/shared"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(imageCropperControls)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const service = useMachine(imageCropper.machine, {
    id: useId(),
    zoom,
    onZoomChange(details) {
      setZoom(details.zoom)
    },
    rotation,
    onRotationChange(details) {
      setRotation(details.rotation)
    },
    cropShape: "circle",
    ...controls.context,
  })

  const api = imageCropper.connect(service, normalizeProps)

  return (
    <>
      <main className="image-cropper">
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <img src="https://picsum.photos/seed/a/500/300" {...api.getImageProps()} />
            <div {...api.getSelectionProps()}>
              {handlePositions.map((position) => (
                <div key={position} {...api.getHandleProps({ position })}>
                  <div />
                </div>
              ))}
            </div>
          </div>
        </div>
        <label>
          Zoom:
          <input
            type="range"
            min={service.prop("minZoom")}
            max={service.prop("maxZoom")}
            step={service.prop("zoomStep")}
            value={zoom}
            data-testid="zoom-slider"
            onChange={(e) => api.setZoom(Number(e.currentTarget.value))}
          />
        </label>
        <label>
          Rotation:
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            data-testid="rotation-slider"
            onChange={(e) => api.setRotation(Number(e.currentTarget.value))}
          />
        </label>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
      </Toolbar>
    </>
  )
}
