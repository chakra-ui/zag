<script setup lang="ts">
import * as toolbar from "@zag-js/toolbar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-vue-next"
import "@styles/toolbar.css"
import "@styles/tooltip.css"

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <ToolbarTooltipButton :api="api" value="bold" label="Bold">
        <BoldIcon />
      </ToolbarTooltipButton>
      <ToolbarTooltipButton :api="api" value="italic" label="Italic">
        <ItalicIcon />
      </ToolbarTooltipButton>
      <ToolbarTooltipButton :api="api" value="underline" label="Underline">
        <UnderlineIcon />
      </ToolbarTooltipButton>
    </div>
    <p class="toolbar-note">
      Hover or focus an icon button to see its tooltip. Arrow keys still move roving focus normally.
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
