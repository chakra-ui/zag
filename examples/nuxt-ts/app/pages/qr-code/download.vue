<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"

const preview = ref<string | null>(null)

const service = useMachine(qrCode.machine, {
  id: useId(),
  value: "https://zagjs.com",
  encoding: { ecc: "H" },
})

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <main class="qr-code">
    <div v-bind="api.getRootProps()">
      <svg v-bind="api.getFrameProps()">
        <path v-bind="api.getPatternProps()" />
      </svg>
      <div v-bind="api.getOverlayProps()">
        <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
      </div>
    </div>

    <button v-bind="api.getDownloadTriggerProps({ mimeType: 'image/png', quality: 1, fileName: 'qr-code.png' })">
      Download
    </button>
    <button @click="api.getDataUrl('image/png', 1).then((data) => (preview = data))">Preview</button>

    <img v-if="preview" width="120" height="120" :src="preview" alt="qr-code preview" />
  </main>
</template>
