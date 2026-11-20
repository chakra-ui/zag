<script setup lang="ts">
import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/image-cropper.css"

const id = useId()
const src = ref("")
const zoom = ref(1)
const avatar = ref("")

const service = useMachine(
  imageCropper.machine,
  computed<imageCropper.Props>(() => ({
    id,
    cropShape: "circle",
    aspectRatio: 1,
    zoom: zoom.value,
    onZoomChange: (details) => (zoom.value = details.zoom),
  })),
)
const api = computed(() => imageCropper.connect(service, normalizeProps))

watch(src, (_next, previous) => {
  if (previous) URL.revokeObjectURL(previous)
})

function onFileChange(event: Event) {
  const { files } = event.currentTarget as HTMLInputElement
  if (!files || files.length === 0) return
  src.value = URL.createObjectURL(files[0])
}

async function save() {
  const url = await api.value.getCroppedImage({ output: "dataUrl", type: "image/png" })
  if (typeof url === "string") avatar.value = url
}

function startOver() {
  src.value = ""
  avatar.value = ""
  zoom.value = 1
}
</script>

<template>
  <main>
    <div class="image-cropper-avatar-upload">
      <p class="hint">Pick a photo from your device, frame your face in the circle, then save.</p>
      <label v-if="!src" class="picker">
        <span>Choose a photo</span>
        <input type="file" accept="image/*" @change="onFileChange" />
      </label>
      <template v-else>
        <div v-bind="api.getRootProps()">
          <div v-bind="api.getViewportProps()">
            <img :src="src" alt="Selected for your avatar" v-bind="api.getImageProps()" />
            <div v-bind="api.getSelectionProps()" />
          </div>
        </div>
        <label class="zoom">
          <span>Zoom</span>
          <input
            type="range"
            aria-label="Zoom"
            :min="service.prop('minZoom')"
            :max="service.prop('maxZoom')"
            :step="0.1"
            :value="zoom"
            @input="api.setZoom(Number(($event.currentTarget as HTMLInputElement).value))"
          />
        </label>
        <div class="actions">
          <button type="button" @click="save">Save avatar</button>
          <button type="button" @click="startOver">Choose another photo</button>
        </div>
      </template>
      <img v-if="avatar" class="avatar-preview" :src="avatar" alt="Your new avatar" />
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['naturalSize', 'crop', 'zoom']" />
  </Toolbar>
</template>
