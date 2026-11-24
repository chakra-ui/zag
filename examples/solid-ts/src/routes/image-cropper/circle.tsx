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
  const [preview, setPreview] = createSignal<string | null>(null)

  const id = createUniqueId()
  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>(() => ({
      id,
      cropShape: "circle",
      zoom: zoom(),
      onZoomChange(details) {
        setZoom(details.zoom)
      },
      rotation: rotation(),
      onRotationChange(details) {
        setRotation(details.rotation)
      },
    })),
  )

  const api = createMemo(() => imageCropper.connect(service, normalizeProps))

  return (
    <>
      <main class="image-cropper">
        <div {...api().getRootProps()}>
          <div {...api().getViewportProps()}>
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=300&fit=crop"
              crossorigin="anonymous"
              {...api().getImageProps()}
            />
            <div {...api().getSelectionProps()}>
              <For each={imageCropper.placements}>
                {(placement) => (
                  <div {...api().getHandleProps({ placement })}>
                    <div />
                  </div>
                )}
              </For>
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
        <button
          onClick={() =>
            api()
              .getCroppedImage({ output: "dataUrl" })
              .then((url) => setPreview(url as string))
          }
        >
          Export
        </button>
        <Show when={preview()}>{(url) => <img src={url()} alt="Cropped result" width={120} />}</Show>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
      </Toolbar>
    </>
  )
}
