<script setup lang="ts">
import * as tree from "@zag-js/tree-view"
// import { treeControls, tree-viewData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(tree.machine({ id: "1" }))

const api = computed(() => tree.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="tree-view">
    <div v-bind="api.rootProps"></div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
