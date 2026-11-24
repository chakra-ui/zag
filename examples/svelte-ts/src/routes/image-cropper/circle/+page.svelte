<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as imageCropper from "@zag-js/image-cropper"
  import { imageCropperControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/image-cropper.css"

  const controls = useControls(imageCropperControls)

  let zoom = $state(1)
  let rotation = $state(0)
  let preview = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>({
      id,
      cropShape: "circle",
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
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=300&fit=crop"
        crossorigin="anonymous"
        {...api.getImageProps()}
        alt="Cropper"
      />
      <div {...api.getSelectionProps()}>
        {#each imageCropper.placements as placement}
          <div {...api.getHandleProps({ placement })}>
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
  <button onclick={() => api.getCroppedImage({ output: "dataUrl" }).then((url) => (preview = url as string))}>
    Export
  </button>
  {#if preview}
    <img src={preview} alt="Cropped result" width="120" />
  {/if}
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
</Toolbar>
