<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { qrCodeControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/qr-code.css"

const controls = useControls(qrCodeControls)

const service = useMachine(
  qrCode.machine,
  controls.mergeProps<qrCode.Props>({
    id: useId(),
    encoding: { ecc: "H" },
  }),
)

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <main class="qr-code">
    <div class="vstack">
      <div v-bind="api.getRootProps()">
        <svg v-bind="api.getFrameProps()">
          <path v-bind="api.getPatternProps()" />
        </svg>
      </div>
      <span class="qr-caption">{{ api.value }}</span>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['encoded']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
