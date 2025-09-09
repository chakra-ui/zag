<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDownIcon } from "lucide-vue-next"

const controls = useControls(collapsibleControls)

const service = useMachine(
  collapsible.machine,
  controls.mergeProps<collapsible.Props>({
    id: useId(),
  }),
)

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <main class="collapsible">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getTriggerProps()">
        Collapsible Trigger
        <div v-bind="api.getIndicatorProps()">
          <ChevronDownIcon />
        </div>
      </button>
      <div v-bind="api.getContentProps()">
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
          id est laborum. <a href="#">Some Link</a>
        </p>
      </div>
    </div>

    <div>
      <div>Toggle Controls</div>
      <button data-testid="open-button" @click="api.setOpen(true)">Open</button>
      <button @click="api.setOpen(false)">Close</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" :state="controls.context" />
    </template>
  </Toolbar>
</template>
