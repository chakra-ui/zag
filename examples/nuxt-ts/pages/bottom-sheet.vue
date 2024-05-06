<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { bottomSheetControls, bottomSheetData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(bottomSheet.machine({ id: "1" }))

const api = computed(() => bottomSheet.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="bottom-sheet">
    <div v-bind="api.rootProps">
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
