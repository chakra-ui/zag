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
  let flip = $state<imageCropper.FlipState>({ horizontal: false, vertical: false })
  let selectedHandle = $state<imageCropper.HandlePosition>("e")
  let resizeStep = $state(10)
  let croppedImageUrl = $state<string | null>(null)
  let isExporting = $state(false)

  const id = $props.id()
  const service = useMachine(
    imageCropper.machine,
    controls.mergeProps<imageCropper.Props>(() => ({
      id,
      zoom,
      onZoomChange(details) {
        zoom = details.zoom
      },
      rotation,
      onRotationChange(details) {
        rotation = details.rotation
      },
      flip,
      onFlipChange(details) {
        flip = details.flip
      },
    })),
  )

  const api = $derived(imageCropper.connect(service, normalizeProps))

  const applyResize = (direction: "grow" | "shrink") => {
    const multiplier = direction === "grow" ? 1 : -1
    const amount = resizeStep * multiplier
    api.resize(selectedHandle, amount)
  }

  const centerCrop = () => {
    const { crop, viewportRect } = api
    api.setCrop({
      ...crop,
      x: (viewportRect.width - crop.width) / 2,
      y: (viewportRect.height - crop.height) / 2,
    })
  }

  const fillViewport = () => {
    const { viewportRect } = api
    api.setCrop({ x: 0, y: 0, width: viewportRect.width, height: viewportRect.height })
  }

  const handleExportImage = async (output: "blob" | "dataUrl") => {
    isExporting = true
    try {
      const result = await api.getCroppedImage({ output })
      if (result) {
        if (output === "dataUrl") {
          croppedImageUrl = result as string
        } else {
          const blob = result as Blob
          croppedImageUrl = URL.createObjectURL(blob)
        }
      }
    } catch (error) {
      console.error("Failed to export image:", error)
    } finally {
      isExporting = false
    }
  }

  const handleDownloadImage = async () => {
    isExporting = true
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
      isExporting = false
    }
  }
</script>

<main class="image-cropper">
  <div {...api.getRootProps()}>
    <div {...api.getViewportProps()}>
      <img src="https://picsum.photos/seed/a/500/300" crossorigin="anonymous" {...api.getImageProps()} />
      <div {...api.getSelectionProps()}>
        {#each imageCropper.placements as placement (placement)}
          <div {...api.getHandleProps({ placement })}>
            <div></div>
          </div>
        {/each}
        <div {...api.getGridProps({ axis: "horizontal" })}></div>
        <div {...api.getGridProps({ axis: "vertical" })}></div>
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
  <fieldset>
    <legend>Flip</legend>
    <label>
      <input
        type="checkbox"
        checked={flip.horizontal}
        onchange={(event) => api.flipHorizontally(event.currentTarget.checked)}
      />
      Horizontal
    </label>
    <label>
      <input
        type="checkbox"
        checked={flip.vertical}
        onchange={(event) => api.flipVertically(event.currentTarget.checked)}
      />
      Vertical
    </label>
    <div>
      <button type="button" onclick={() => api.flipHorizontally()}>Toggle horizontal flip</button>
      <button type="button" onclick={() => api.flipVertically()}>Toggle vertical flip</button>
      <button type="button" onclick={() => api.setFlip({ horizontal: false, vertical: false })}>Reset flips</button>
    </div>
  </fieldset>
  <div>
    <label>
      Resize handle:
      <select
        data-testid="resize-handle-select"
        value={selectedHandle}
        onchange={(event) => (selectedHandle = event.currentTarget.value as imageCropper.HandlePosition)}
      >
        {#each imageCropper.placements as placement (placement)}
          <option value={placement}>{placement}</option>
        {/each}
      </select>
    </label>
    <label>
      Resize step (px):
      <input
        data-testid="resize-step-input"
        type="number"
        min={1}
        value={resizeStep}
        oninput={(event) => {
          const value = Number(event.currentTarget.value)
          resizeStep = Number.isFinite(value) && value > 0 ? value : 1
        }}
      />
    </label>
    <div>
      <button type="button" data-testid="grow-button" onclick={() => applyResize("grow")}>Grow selection</button>
      <button type="button" data-testid="shrink-button" onclick={() => applyResize("shrink")}>Shrink selection</button>
    </div>
  </div>

  <div>
    <button type="button" data-testid="reset-button" onclick={() => api.reset()}>Reset</button>
    <button type="button" data-testid="center-crop-button" onclick={centerCrop}>Center selection</button>
    <button type="button" data-testid="fill-crop-button" onclick={fillViewport}>Fill viewport</button>
  </div>

  <fieldset>
    <legend>Export Cropped Image</legend>
    <div>
      <button type="button" onclick={() => handleExportImage("blob")} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export as Blob"}
      </button>
      <button type="button" onclick={() => handleExportImage("dataUrl")} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export as Data URL"}
      </button>
      <button type="button" onclick={handleDownloadImage} disabled={isExporting}>
        {isExporting ? "Downloading..." : "Download PNG"}
      </button>
      {#if croppedImageUrl}
        <button
          type="button"
          onclick={() => {
            if (croppedImageUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(croppedImageUrl)
            }
            croppedImageUrl = null
          }}
        >
          Clear Preview
        </button>
      {/if}
    </div>
    {#if croppedImageUrl}
      <div>
        <h3>Cropped Image Preview:</h3>
        <img src={croppedImageUrl} alt="Cropped result" style="max-width: 100%; border: 1px solid #ccc" />
      </div>
    {/if}
  </fieldset>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["naturalSize", "crop", "zoom", "rotation", "flip", "offset"]} />
</Toolbar>
