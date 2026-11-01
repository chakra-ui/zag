<script setup lang="ts">
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import * as toggle from "@zag-js/toggle-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-vue-next"
import "@styles/toggle-group.css"

const icons = { bold: BoldIcon, italic: ItalicIcon, underline: UnderlineIcon }

const controls = useControls(toggleGroupControls)

const service = useMachine(
  toggle.machine,
  controls.mergeProps<toggle.Props>({
    id: useId(),
  }),
)
const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <div class="hstack gap-4">
      <!-- Focus target outside the group, for tab order checks -->
      <button>Outside</button>
      <div v-bind="api.getRootProps()">
        <button
          v-for="item in toggleGroupData"
          :key="item.value"
          v-bind="api.getItemProps({ value: item.value })"
          :aria-label="item.value"
        >
          <component :is="icons[item.value as keyof typeof icons]" />
        </button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
