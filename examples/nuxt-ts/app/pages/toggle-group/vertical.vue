<script setup lang="ts">
import * as toggle from "@zag-js/toggle-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { EraserIcon, HandIcon, MousePointer2Icon, PencilIcon, SquareIcon } from "lucide-vue-next"
import "@styles/toggle-group.css"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2Icon },
  { value: "hand", label: "Hand", icon: HandIcon },
  { value: "pencil", label: "Pencil", icon: PencilIcon },
  { value: "shape", label: "Shape", icon: SquareIcon },
  { value: "eraser", label: "Eraser", icon: EraserIcon },
] as const

const service = useMachine(toggle.machine, {
  id: useId(),
  orientation: "vertical",
  defaultValue: ["select"],
  deselectable: false,
})

const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <div class="hstack gap-4 items-start">
      <!-- Arrow up/down move focus in a vertical group -->
      <div v-bind="api.getRootProps()" aria-label="Tools">
        <button
          v-for="tool in tools"
          :key="tool.value"
          v-bind="api.getItemProps({ value: tool.value })"
          :aria-label="tool.label"
          :title="tool.label"
        >
          <component :is="tool.icon" />
        </button>
      </div>
      <p class="toggle-group-preview">
        Active tool: <strong>{{ tools.find((tool) => tool.value === api.value[0])?.label }}</strong>
      </p>
    </div>
  </main>
</template>
