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
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

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

  const handleExportImage = async (output: "blob" | "dataUrl") => {
    setIsExporting(true)
    try {
      const result = await api.getCroppedImage({ output })
      if (result) {
        if (output === "dataUrl") {
          setCroppedImageUrl(result as string)
        } else {
          const blob = result as Blob
          const url = URL.createObjectURL(blob)
          setCroppedImageUrl(url)
        }
      }
    } catch (error) {
      console.error("Failed to export image:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadImage = async () => {
    setIsExporting(true)
    try {
      const blob = await api.getCroppedImage({ type: "image/png" })
      if (blob && blob instanceof Blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `cropped-image-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to download image:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <main className="image-cropper">
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <img src="https://picsum.photos/seed/a/500/300" crossOrigin="anonymous" {...api.getImageProps()} />
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
        <fieldset>
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
          <div>
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
        <div>
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
          <div>
            <button type="button" onClick={() => applyResize("grow")}>
              Grow selection
            </button>
            <button type="button" onClick={() => applyResize("shrink")}>
              Shrink selection
            </button>
          </div>
        </div>

        <fieldset>
          <legend>Export Cropped Image</legend>
          <div>
            <button type="button" onClick={() => handleExportImage("blob")} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export as Blob"}
            </button>
            <button type="button" onClick={() => handleExportImage("dataUrl")} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export as Data URL"}
            </button>
            <button type="button" onClick={handleDownloadImage} disabled={isExporting}>
              {isExporting ? "Downloading..." : "Download PNG"}
            </button>
            {croppedImageUrl && (
              <button
                type="button"
                onClick={() => {
                  if (croppedImageUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(croppedImageUrl)
                  }
                  setCroppedImageUrl(null)
                }}
              >
                Clear Preview
              </button>
            )}
          </div>
          {croppedImageUrl && (
            <div>
              <h3>Cropped Image Preview:</h3>
              <img src={croppedImageUrl} alt="Cropped result" style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
            </div>
          )}
        </fieldset>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "flip", "offset"]} />
      </Toolbar>
    </>
  )
}
