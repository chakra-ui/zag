import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { imageCropperControls } from "@zag-js/shared"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/image-cropper.css"

export default function Page() {
  const controls = useControls(imageCropperControls)
  const [zoom, setZoom] = createSignal(1)
  const [rotation, setRotation] = createSignal(0)
  const [flip, setFlip] = createSignal<imageCropper.FlipState>({ horizontal: false, vertical: false })
  const [selectedHandle, setSelectedHandle] = createSignal<imageCropper.HandlePosition>("e")
  const [resizeStep, setResizeStep] = createSignal(10)
  const [croppedImageUrl, setCroppedImageUrl] = createSignal<string | null>(null)
  const [isExporting, setIsExporting] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>(() => ({
      id,
      zoom: zoom(),
      onZoomChange(details) {
        setZoom(details.zoom)
      },
      rotation: rotation(),
      onRotationChange(details) {
        setRotation(details.rotation)
      },
      flip: flip(),
      onFlipChange(details) {
        setFlip(details.flip)
      },
    })),
  )

  const api = createMemo(() => imageCropper.connect(service, normalizeProps))

  const applyResize = (direction: "grow" | "shrink") => {
    const multiplier = direction === "grow" ? 1 : -1
    api().resize(selectedHandle(), resizeStep() * multiplier)
  }

  const centerCrop = () => {
    const { crop, viewportRect } = api()
    api().setCrop({
      ...crop,
      x: (viewportRect.width - crop.width) / 2,
      y: (viewportRect.height - crop.height) / 2,
    })
  }

  const fillViewport = () => {
    const { viewportRect } = api()
    api().setCrop({ x: 0, y: 0, width: viewportRect.width, height: viewportRect.height })
  }

  const handleExportImage = async (output: "blob" | "dataUrl") => {
    setIsExporting(true)
    try {
      const result = await api().getCroppedImage({ output })
      if (result) {
        setCroppedImageUrl(output === "dataUrl" ? (result as string) : URL.createObjectURL(result as Blob))
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
      const blob = await api().getCroppedImage({ type: "image/png" })
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

  const clearPreview = () => {
    const url = croppedImageUrl()
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
    setCroppedImageUrl(null)
  }

  return (
    <>
      <main class="image-cropper">
        <div {...api().getRootProps()}>
          <div {...api().getViewportProps()}>
            <img src="https://picsum.photos/seed/a/500/300" crossOrigin="anonymous" {...api().getImageProps()} />
            <div {...api().getSelectionProps()}>
              <For each={imageCropper.placements}>
                {(placement) => (
                  <div {...api().getHandleProps({ placement })}>
                    <div />
                  </div>
                )}
              </For>
              <div {...api().getGridProps({ axis: "horizontal" })} />
              <div {...api().getGridProps({ axis: "vertical" })} />
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
            value={zoom()}
            data-testid="zoom-slider"
            onInput={(e) => api().setZoom(Number(e.currentTarget.value))}
          />
        </label>
        <label>
          Rotation:
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation()}
            data-testid="rotation-slider"
            onInput={(e) => api().setRotation(Number(e.currentTarget.value))}
          />
        </label>
        <fieldset>
          <legend>Flip</legend>
          <label>
            <input
              type="checkbox"
              checked={flip().horizontal}
              onChange={(event) => api().flipHorizontally(event.currentTarget.checked)}
            />
            Horizontal
          </label>
          <label>
            <input
              type="checkbox"
              checked={flip().vertical}
              onChange={(event) => api().flipVertically(event.currentTarget.checked)}
            />
            Vertical
          </label>
          <div>
            <button type="button" onClick={() => api().flipHorizontally()}>
              Toggle horizontal flip
            </button>
            <button type="button" onClick={() => api().flipVertically()}>
              Toggle vertical flip
            </button>
            <button type="button" onClick={() => api().setFlip({ horizontal: false, vertical: false })}>
              Reset flips
            </button>
          </div>
        </fieldset>
        <div>
          <label>
            Resize handle:
            <select
              data-testid="resize-handle-select"
              value={selectedHandle()}
              onChange={(event) => setSelectedHandle(event.currentTarget.value as imageCropper.HandlePosition)}
            >
              <For each={imageCropper.placements}>{(placement) => <option value={placement}>{placement}</option>}</For>
            </select>
          </label>
          <label>
            Resize step (px):
            <input
              data-testid="resize-step-input"
              type="number"
              min={1}
              value={resizeStep()}
              onInput={(event) => {
                const value = Number(event.currentTarget.value)
                setResizeStep(Number.isFinite(value) && value > 0 ? value : 1)
              }}
            />
          </label>
          <div>
            <button type="button" data-testid="grow-button" onClick={() => applyResize("grow")}>
              Grow selection
            </button>
            <button type="button" data-testid="shrink-button" onClick={() => applyResize("shrink")}>
              Shrink selection
            </button>
          </div>
        </div>

        <div>
          <button type="button" data-testid="reset-button" onClick={() => api().reset()}>
            Reset
          </button>
          <button type="button" data-testid="center-crop-button" onClick={centerCrop}>
            Center selection
          </button>
          <button type="button" data-testid="fill-crop-button" onClick={fillViewport}>
            Fill viewport
          </button>
        </div>

        <fieldset>
          <legend>Export Cropped Image</legend>
          <div>
            <button type="button" onClick={() => handleExportImage("blob")} disabled={isExporting()}>
              {isExporting() ? "Exporting..." : "Export as Blob"}
            </button>
            <button type="button" onClick={() => handleExportImage("dataUrl")} disabled={isExporting()}>
              {isExporting() ? "Exporting..." : "Export as Data URL"}
            </button>
            <button type="button" onClick={handleDownloadImage} disabled={isExporting()}>
              {isExporting() ? "Downloading..." : "Download PNG"}
            </button>
            <Show when={croppedImageUrl()}>
              <button type="button" onClick={clearPreview}>
                Clear Preview
              </button>
            </Show>
          </div>
          <Show when={croppedImageUrl()}>
            {(url) => (
              <div>
                <h3>Cropped Image Preview:</h3>
                <img src={url()} alt="Cropped result" style={{ "max-width": "100%", border: "1px solid #ccc" }} />
              </div>
            )}
          </Show>
        </fieldset>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "flip", "offset"]} />
      </Toolbar>
    </>
  )
}
