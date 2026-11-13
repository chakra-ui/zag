<script setup lang="ts">
import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/avatar.css"

const images = avatarData.full

const log = ref<string[]>([])
const index = ref(0)
const src = ref(images[0])
const showImage = ref(true)
const wrapped = ref(false)

const service = useMachine(avatar.machine, {
  id: useId(),
  onStatusChange({ status }) {
    log.value = [...log.value, status]
  },
})
const api = computed(() => avatar.connect(service, normalizeProps))

const nextImage = () => {
  index.value = (index.value + 1) % images.length
  src.value = images[index.value]
}
</script>

<template>
  <main class="avatar">
    <div v-bind="api.getRootProps()">
      <span v-bind="api.getFallbackProps()">PA</span>
      <template v-if="showImage">
        <picture v-if="wrapped">
          <img alt="" referrerPolicy="no-referrer" :src="src" v-bind="api.getImageProps()" />
        </picture>
        <img v-else alt="" referrerPolicy="no-referrer" :src="src" v-bind="api.getImageProps()" />
      </template>
    </div>

    <div class="controls">
      <button @click="nextImage">Next image</button>
      <button @click="src = avatarData.broken">Broken image</button>
      <button @click="showImage = !showImage">Toggle image</button>
      <button @click="wrapped = !wrapped">Wrap in picture: {{ String(wrapped) }}</button>
    </div>

    <p>
      Status: <output aria-label="Load status">{{ api.status }}</output>
    </p>
    <p>
      onStatusChange: <output aria-label="Status reports">{{ log.join(",") || "-" }}</output>
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
