<script setup lang="ts">
import * as toggle from "@zag-js/toggle-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-vue-next"
import "@styles/toggle-group.css"

const options = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
  { value: "justify", label: "Justify", icon: AlignJustifyIcon },
] as const

const service = useMachine(toggle.machine, {
  id: useId(),
  defaultValue: ["left"],
  // Single choice that can't be cleared, like a radio group
  deselectable: false,
})

const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()" aria-label="Text alignment">
        <button
          v-for="option in options"
          :key="option.value"
          v-bind="api.getItemProps({ value: option.value })"
          :aria-label="option.label"
          :title="option.label"
        >
          <component :is="option.icon" />
        </button>
      </div>

      <p class="toggle-group-preview" :style="{ textAlign: api.value[0] as 'left' }">
        Zag machines handle the behavior; you bring the markup and styles. This paragraph follows the selected
        alignment.
      </p>
    </div>
  </main>
</template>
