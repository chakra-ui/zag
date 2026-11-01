<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ ecc: "L" | "M" | "Q" | "H"; recovery: string }>()

// Higher levels add redundancy: the same value needs more modules
const service = useMachine(qrCode.machine, {
  id: useId(),
  value: "https://zagjs.com",
  encoding: { ecc: props.ecc },
})

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <div class="qr-tile">
    <div v-bind="api.getRootProps()" :style="{ '--qr-size': '120px' }">
      <svg v-bind="api.getFrameProps()">
        <path v-bind="api.getPatternProps()" />
      </svg>
    </div>
    <strong>Level {{ ecc }}</strong>
    <span>{{ recovery }}</span>
  </div>
</template>
