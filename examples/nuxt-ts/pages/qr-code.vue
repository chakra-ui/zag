<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { qrCodeControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(qrCodeControls)

const service = useMachine(qrCode.machine, {
  id: useId(),
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
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['encoded']" />
  </Toolbar>
</template>
