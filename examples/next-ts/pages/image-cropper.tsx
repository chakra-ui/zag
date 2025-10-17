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
  const [flip, setFlip] = useState<imageCropper.FlipState>({ horizontal: false, vertical: false })
  const [selectedHandle, setSelectedHandle] = useState<imageCropper.HandlePosition>("right")
  const [resizeStep, setResizeStep] = useState(10)

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
    flip,
    onFlipChange(details) {
      setFlip(details.flip)
    },
    ...controls.context,
  })

  const api = imageCropper.connect(service, normalizeProps)

  const applyResize = (direction: "grow" | "shrink") => {
    const multiplier = direction === "grow" ? 1 : -1
    const amount = resizeStep * multiplier
    api.resize(selectedHandle, amount)
  }

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
        <fieldset className="flip-controls">
          <legend>Flip</legend>
          <label>
            <input
              type="checkbox"
              checked={flip.horizontal}
              onChange={(event) => api.flipHorizontally(event.currentTarget.checked)}
            />
            Horizontal
          </label>
          <label>
            <input
              type="checkbox"
              checked={flip.vertical}
              onChange={(event) => api.flipVertically(event.currentTarget.checked)}
            />
            Vertical
          </label>
          <div className="flip-buttons">
            <button type="button" onClick={() => api.flipHorizontally()}>
              Toggle horizontal flip
            </button>
            <button type="button" onClick={() => api.flipVertically()}>
              Toggle vertical flip
            </button>
            <button type="button" onClick={() => api.setFlip({ horizontal: false, vertical: false })}>
              Reset flips
            </button>
          </div>
        </fieldset>
        <div className="resize-controls">
          <label>
            Resize handle:
            <select
              value={selectedHandle}
              onChange={(event) => setSelectedHandle(event.currentTarget.value as imageCropper.HandlePosition)}
            >
              {handlePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>
          <label>
            Resize step (px):
            <input
              type="number"
              min={1}
              value={resizeStep}
              onChange={(event) => {
                const value = Number(event.currentTarget.value)
                setResizeStep(Number.isFinite(value) && value > 0 ? value : 1)
              }}
            />
          </label>
          <div className="resize-buttons">
            <button type="button" onClick={() => applyResize("grow")}>
              Grow selection
            </button>
            <button type="button" onClick={() => applyResize("shrink")}>
              Shrink selection
            </button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "flip", "offset"]} />
      </Toolbar>
    </>
  )
}
