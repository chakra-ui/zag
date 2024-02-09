<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(collapsibleControls)

const [state, send] = useMachine(collapsible.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => collapsible.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="collapsible">
    <div v-bind="api.rootProps">
      <button v-bind="api.triggerProps">Collapsible Trigger</button>
      <div v-bind="api.contentProps">
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
          id est laborum. <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" :state="controls.context" />
    </template>
  </Toolbar>
</template>
