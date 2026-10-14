<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/qr-code.css"

const service = useMachine(qrCode.machine, {
  id: useId(),
  value: "https://zagjs.com",
  // The logo hides the middle modules; the highest error correction recovers them
  encoding: { ecc: "H" },
})

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <main class="qr-code">
    <div class="vstack">
      <div v-bind="api.getRootProps()">
        <svg v-bind="api.getFrameProps()">
          <path v-bind="api.getPatternProps()" />
        </svg>
        <div v-bind="api.getOverlayProps()">
          <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
        </div>
      </div>
      <span class="qr-caption">{{ api.value }} · error correction H</span>
    </div>
  </main>
</template>
