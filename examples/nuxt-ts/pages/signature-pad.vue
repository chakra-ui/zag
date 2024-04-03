<script setup lang="ts">
import * as signaturePad from "@zag-js/signature-pad"
import { signaturePadControls, signaturePadData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(signaturePad.machine({ id: "1" }))

const api = computed(() => signaturePad.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="signature-pad">
    <div v-bind="api.rootProps">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
