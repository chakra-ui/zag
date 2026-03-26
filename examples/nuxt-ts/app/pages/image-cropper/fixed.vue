<script setup lang="ts">
import * as imageCropper from "@zag-js/image-cropper"
import { imageCropperControls } from "@zag-js/shared"
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
    fixedCropArea: true,
  })),
)

const api = computed(() => imageCropper.connect(service, normalizeProps))
</script>

<template>
  <main class="image-cropper">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getViewportProps()">
        <img src="https://picsum.photos/seed/a/500/300" v-bind="api.getImageProps()" />
        <div v-bind="api.getSelectionProps()" />
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
        @input="(e) => api.setRotation(Number((e.target as HTMLInputElement).value))"
      />
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['naturalSize', 'crop', 'zoom', 'rotation', 'offset']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
