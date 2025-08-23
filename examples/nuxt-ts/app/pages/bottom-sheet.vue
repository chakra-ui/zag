<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(bottomSheet.machine, { id: useId() })

const api = computed(() => bottomSheet.connect(service, normalizeProps))
</script>

<template>
  <main className="bottom-sheet">
    <div v-bind="api.getContentProps()"></div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
