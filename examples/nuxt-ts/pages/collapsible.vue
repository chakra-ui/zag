<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls, collapsibleData } from "@zag-js/shared"
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
      <div>
        <span>{{ collapsibleData.headline }}</span>
        <button v-if="api.isOpen" v-bind="api.triggerProps">Collapse</button>
        <button v-if="!api.isOpen" v-bind="api.triggerProps">Expand</button>
      </div>

      <div>
        <span>{{ collapsibleData.visibleItem }}</span>
      </div>

      <div v-bind="api.contentProps">
        <div v-for="item in data" :key="item.id">
          <div>{{ item }}</div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
