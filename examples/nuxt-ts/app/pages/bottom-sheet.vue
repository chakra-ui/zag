<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { bottomSheetControls, bottomSheetData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"

const service = useMachine(bottomSheet.machine, {
  id: useId(),
})

const api = computed(() => bottomSheet.connect(service, normalizeProps))
</script>

<template>
  <main className="bottom-sheet">
    <div v-bind="api.rootProps"></div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
