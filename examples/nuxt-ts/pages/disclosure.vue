<script setup lang="ts">
import * as disclosure from "@zag-js/disclosure"
import { disclosureControls, disclosureData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(disclosureControls)

const [state, send] = useMachine(disclosure.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => disclosure.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="disclosure">
        <a href="#" v-bind="api.buttonProps">
          {{ disclosureData.label }}
        </a>
        <div {...api.disclosureProps}>
          <ul>
              <li v-for="item in disclosureData.content">
                <a href="item.href">{{ item.label }}</a>
              </li>
          </ul>
        </div>
      </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
