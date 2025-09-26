<script setup lang="ts">
import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(imageCropper.machine, { id: useId() })

const api = computed(() => imageCropper.connect(service, normalizeProps))
</script>

<template>
  <main className="image-cropper">
    <div v-bind="api.getRootProps()"></div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
