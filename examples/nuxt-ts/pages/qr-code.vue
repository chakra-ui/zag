<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { qrCodeControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(qrCodeControls)

const [state, send] = useMachine(
  qrCode.machine({
    id: "1",
    encoding: { ecc: "H" },
  }),
  {
    context: controls.context,
  },
)

const api = computed(() => qrCode.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="qr-code">
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
    <StateVisualizer :state="state" :omit="['encoded']" />
  </Toolbar>
</template>
