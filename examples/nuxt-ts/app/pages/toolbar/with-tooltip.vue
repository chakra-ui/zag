<script setup lang="ts">
import * as toolbar from "@zag-js/toolbar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"
import "@styles/tooltip.css"

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <ToolbarTooltipButton :api="api" value="bold" label="Bold">
        <strong>B</strong>
      </ToolbarTooltipButton>
      <ToolbarTooltipButton :api="api" value="italic" label="Italic">
        <em>I</em>
      </ToolbarTooltipButton>
      <ToolbarTooltipButton :api="api" value="underline" label="Underline">
        <u>U</u>
      </ToolbarTooltipButton>
    </div>
    <p>Hover or focus an icon button to see its tooltip. Arrow keys still move roving focus normally.</p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
