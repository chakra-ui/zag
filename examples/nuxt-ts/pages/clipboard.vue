<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(clipboardControls)

const [state, send] = useMachine(clipboard.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => clipboard.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="clipboard">
    <div>
      <button v-bind="api.triggerProps">Copy Text</button>
      <div v-bind="api.getIndicatorProps({ copied: true })">Copied</div>
      <div v-bind="api.getIndicatorProps({ copied: false })">Copy</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
