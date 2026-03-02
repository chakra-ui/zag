<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as imageCropper from "@zag-js/image-cropper"
  import { imageCropperControls, handlePositions } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(imageCropperControls)

  let zoom = $state(1)
  let rotation = $state(0)

  const id = $props.id()
  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>({
      id,
      get zoom() {
        return zoom
      },
      onZoomChange(details) {
        zoom = details.zoom
      },
      get rotation() {
        return rotation
      },
      onRotationChange(details) {
        rotation = details.rotation
      },
    }),
  )

  const api = $derived(imageCropper.connect(service, normalizeProps))
</script>

<main class="image-cropper">
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <img src="https://picsum.photos/seed/a/500/300" {...api.getImageProps()} alt="Cropper" />
      <div {...api.getSelectionProps()}>
        {#each handlePositions as position}
          <div {...api.getHandleProps({ position })}>
            <div></div>
          </div>
        {/each}
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
      oninput={(e) => api.setZoom(Number(e.currentTarget.value))}
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
      oninput={(e) => api.setRotation(Number(e.currentTarget.value))}
    />
  </label>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
</Toolbar>
