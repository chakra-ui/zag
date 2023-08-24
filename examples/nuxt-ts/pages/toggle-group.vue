<script setup lang="ts">
import * as toggle from "@zag-js/toggle-group"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(toggleGroupControls)

const [state, send] = useMachine(toggle.machine({ id: "1" }), {
  context: controls.context,
})
const api = computed(() => toggle.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <button>Outside</button>
    <div v-bind="api.rootProps">
      <button v-for="item in toggleGroupData" :key="item.value" v-bind="api.getToggleProps({ value: item.value })">
        {{ item.label }}
      </button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
