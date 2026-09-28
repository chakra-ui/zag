<script setup lang="ts">
import * as imageCropper from "@zag-js/image-cropper"
import { imageCropperControls, handlePositions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(imageCropperControls)

const zoom = ref(1)
const rotation = ref(0)

const service = useMachine(
  imageCropper.machine,
  computed(() => ({
    ...controls.context.value,
    id: useId(),
    zoom: zoom.value,
    onZoomChange(details) {
      zoom.value = details.zoom
    },
    rotation: rotation.value,
    onRotationChange(details) {
      rotation.value = details.rotation
    },
  })),
)

const api = computed(() => imageCropper.connect(service, normalizeProps))

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
</script>

<template>
  <main class="image-cropper">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <img src="https://picsum.photos/seed/a/500/300" v-bind="api.getImageProps()" />
        <div v-bind="api.getSelectionProps()">
          <div v-for="position in handlePositions" :key="position" v-bind="api.getHandleProps({ position })">
            <div />
          </div>
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
        @input="(e) => api.setZoom(Number((e.target as HTMLInputElement).value))"
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
        @input="(e) => api.setRotation(Number((e.target as HTMLInputElement).value))"
      />
    </label>
    <div>
      <button type="button" data-testid="reset-button" @click="api.reset()">Reset</button>
      <button type="button" data-testid="center-crop-button" @click="centerCrop">Center selection</button>
      <button type="button" data-testid="fill-crop-button" @click="fillViewport">Fill viewport</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['naturalSize', 'crop', 'zoom', 'rotation', 'offset']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
