import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { imageCropperControls, handlePositions } from "@zag-js/shared"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(imageCropperControls)
  const [zoom, setZoom] = createSignal(1)
  const [rotation, setRotation] = createSignal(0)

  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>(() => ({
      id: createUniqueId(),
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
            <img src="https://picsum.photos/seed/a/500/300" {...api().getImageProps()} />
            <div {...api().getSelectionProps()}>
              <For each={handlePositions}>
                {(position) => (
                  <div {...api().getHandleProps({ position })}>
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
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
      </Toolbar>
    </>
  )
}
