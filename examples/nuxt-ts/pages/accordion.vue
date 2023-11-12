<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(accordionControls)

const [state, send] = useMachine(accordion.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => accordion.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="accordion">
    <div v-bind="api.rootProps">
      <div v-for="item in accordionData" v-bind="api.getItemProps({ value: item.id })">
        <h3>
          <button :data-testid="`${item.id}:trigger`" v-bind="api.getItemTriggerProps({ value: item.id })">
            {{ item.label }}
            <div v-bind="api.getItemIndicatorProps({ value: item.id })">{{ ">" }}</div>
          </button>
        </h3>
        <div :data-testid="`${item.id}:content`" v-bind="api.getItemContentProps({ value: item.id })">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
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
