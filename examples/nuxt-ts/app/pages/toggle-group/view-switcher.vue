<script setup lang="ts">
import * as toggle from "@zag-js/toggle-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { LayoutGridIcon, ListIcon } from "lucide-vue-next"
import "@styles/toggle-group.css"

const views = [
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
  { value: "list", label: "List", icon: ListIcon },
] as const

const service = useMachine(toggle.machine, {
  id: useId(),
  defaultValue: ["grid"],
  deselectable: false,
})

const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()" aria-label="View">
        <button v-for="view in views" :key="view.value" v-bind="api.getItemProps({ value: view.value })">
          <component :is="view.icon" />
          {{ view.label }}
        </button>
      </div>

      <div class="toggle-group-items" :data-view="api.value[0]">
        <div v-for="index in 6" :key="index" />
      </div>
    </div>
  </main>
</template>
