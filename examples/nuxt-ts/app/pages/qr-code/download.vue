<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/qr-code.css"

const preview = ref<string | null>(null)

const service = useMachine(qrCode.machine, {
  id: useId(),
  value: "https://zagjs.com",
  encoding: { ecc: "H" },
})

const api = computed(() => qrCode.connect(service, normalizeProps))

const showPreview = async () => {
  preview.value = await api.value.getDataUrl("image/png", 1)
}
</script>

<template>
  <main class="qr-code">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <svg v-bind="api.getFrameProps()">
          <path v-bind="api.getPatternProps()" />
        </svg>
        <div v-bind="api.getOverlayProps()">
          <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
        </div>
      </div>

      <div class="hstack">
        <button v-bind="api.getDownloadTriggerProps({ mimeType: 'image/png', quality: 1, fileName: 'qr-code.png' })">
          Download PNG
        </button>
        <button @click="showPreview">Show as image</button>
      </div>

      <div v-if="preview" class="qr-tile">
        <img width="120" height="120" :src="preview" alt="QR code exported as PNG" />
        <span>Exported PNG</span>
      </div>
    </div>
  </main>
</template>
