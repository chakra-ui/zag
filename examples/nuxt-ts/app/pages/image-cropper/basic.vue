<script setup lang="ts">
import * as imageCropper from "@zag-js/image-cropper"
import { imageCropperControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/image-cropper.css"

const controls = useControls(imageCropperControls)

const id = useId()
const controlProps = controls.mergeProps<imageCropper.Props>({})
const zoom = ref(1)
const rotation = ref(0)
const flip = ref<imageCropper.FlipState>({ horizontal: false, vertical: false })
const selectedHandle = ref<imageCropper.HandlePosition>("e")
const resizeStep = ref(10)
const croppedImageUrl = ref<string | null>(null)
const isExporting = ref(false)

const service = useMachine(
  imageCropper.machine,
  computed(() => ({
    ...controlProps.value,
    id,
    zoom: zoom.value,
    onZoomChange(details: imageCropper.ZoomChangeDetails) {
      zoom.value = details.zoom
    },
    rotation: rotation.value,
    onRotationChange(details: imageCropper.RotationChangeDetails) {
      rotation.value = details.rotation
    },
    flip: flip.value,
    onFlipChange(details: imageCropper.FlipChangeDetails) {
      flip.value = details.flip
    },
  })),
)

const api = computed(() => imageCropper.connect(service, normalizeProps))

const applyResize = (direction: "grow" | "shrink") => {
  const multiplier = direction === "grow" ? 1 : -1
  api.value.resize(selectedHandle.value, resizeStep.value * multiplier)
}

const onResizeStepInput = (event: Event) => {
  const value = Number((event.currentTarget as HTMLInputElement).value)
  resizeStep.value = Number.isFinite(value) && value > 0 ? value : 1
}

const centerCrop = () => {
  const { crop, viewportRect } = api.value
  api.value.setCrop({
    ...crop,
    x: (viewportRect.width - crop.width) / 2,
    y: (viewportRect.height - crop.height) / 2,
  })
}

const fillViewport = () => {
  const { viewportRect } = api.value
  api.value.setCrop({ x: 0, y: 0, width: viewportRect.width, height: viewportRect.height })
}

const handleExportImage = async (output: "blob" | "dataUrl") => {
  isExporting.value = true
  try {
    const result = await api.value.getCroppedImage({ output })
    if (result) {
      croppedImageUrl.value = output === "dataUrl" ? (result as string) : URL.createObjectURL(result as Blob)
    }
  } catch (error) {
    console.error("Failed to export image:", error)
  } finally {
    isExporting.value = false
  }
}

const handleDownloadImage = async () => {
  isExporting.value = true
  try {
    const blob = await api.value.getCroppedImage({ type: "image/png" })
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
    isExporting.value = false
  }
}

const clearPreview = () => {
  const url = croppedImageUrl.value
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
  croppedImageUrl.value = null
}
</script>

<template>
  <main class="image-cropper">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <img src="https://picsum.photos/seed/a/500/300" crossorigin="anonymous" v-bind="api.getImageProps()" />
        <div v-bind="api.getSelectionProps()">
          <div v-for="placement in imageCropper.placements" :key="placement" v-bind="api.getHandleProps({ placement })">
            <div />
          </div>
          <div v-bind="api.getGridProps({ axis: 'horizontal' })" />
          <div v-bind="api.getGridProps({ axis: 'vertical' })" />
        </div>
      </div>
    </div>
    <label>
      Zoom:
      <input
        type="range"
        :min="service.prop('minZoom')"
        :max="service.prop('maxZoom')"
        :step="service.prop('zoomStep')"
        :value="zoom"
        data-testid="zoom-slider"
        @input="(e) => api.setZoom(Number((e.currentTarget as HTMLInputElement).value))"
      />
    </label>
    <label>
      Rotation:
      <input
        type="range"
        :min="0"
        :max="360"
        :step="1"
        :value="rotation"
        data-testid="rotation-slider"
        @input="(e) => api.setRotation(Number((e.currentTarget as HTMLInputElement).value))"
      />
    </label>
    <fieldset>
      <legend>Flip</legend>
      <label>
        <input
          type="checkbox"
          :checked="flip.horizontal"
          @change="(e) => api.flipHorizontally((e.currentTarget as HTMLInputElement).checked)"
        />
        Horizontal
      </label>
      <label>
        <input
          type="checkbox"
          :checked="flip.vertical"
          @change="(e) => api.flipVertically((e.currentTarget as HTMLInputElement).checked)"
        />
        Vertical
      </label>
      <div>
        <button type="button" @click="api.flipHorizontally()">Toggle horizontal flip</button>
        <button type="button" @click="api.flipVertically()">Toggle vertical flip</button>
        <button type="button" @click="api.setFlip({ horizontal: false, vertical: false })">Reset flips</button>
      </div>
    </fieldset>
    <div>
      <label>
        Resize handle:
        <select v-model="selectedHandle" data-testid="resize-handle-select">
          <option v-for="placement in imageCropper.placements" :key="placement" :value="placement">
            {{ placement }}
          </option>
        </select>
      </label>
      <label>
        Resize step (px):
        <input data-testid="resize-step-input" type="number" :min="1" :value="resizeStep" @input="onResizeStepInput" />
      </label>
      <div>
        <button type="button" data-testid="grow-button" @click="applyResize('grow')">Grow selection</button>
        <button type="button" data-testid="shrink-button" @click="applyResize('shrink')">Shrink selection</button>
      </div>
    </div>

    <div>
      <button type="button" data-testid="reset-button" @click="api.reset()">Reset</button>
      <button type="button" data-testid="center-crop-button" @click="centerCrop">Center selection</button>
      <button type="button" data-testid="fill-crop-button" @click="fillViewport">Fill viewport</button>
    </div>

    <fieldset>
      <legend>Export Cropped Image</legend>
      <div>
        <button type="button" :disabled="isExporting" @click="handleExportImage('blob')">
          {{ isExporting ? "Exporting..." : "Export as Blob" }}
        </button>
        <button type="button" :disabled="isExporting" @click="handleExportImage('dataUrl')">
          {{ isExporting ? "Exporting..." : "Export as Data URL" }}
        </button>
        <button type="button" :disabled="isExporting" @click="handleDownloadImage">
          {{ isExporting ? "Downloading..." : "Download PNG" }}
        </button>
        <button v-if="croppedImageUrl" type="button" @click="clearPreview">Clear Preview</button>
      </div>
      <div v-if="croppedImageUrl">
        <h3>Cropped Image Preview:</h3>
        <img :src="croppedImageUrl" alt="Cropped result" style="max-width: 100%; border: 1px solid #ccc" />
      </div>
    </fieldset>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['naturalSize', 'crop', 'zoom', 'rotation', 'flip', 'offset']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
