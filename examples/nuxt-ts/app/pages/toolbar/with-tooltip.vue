<script setup lang="ts">
import * as toolbar from "@zag-js/toolbar"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"
import "@styles/tooltip.css"

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))

const tooltipId = useId()
const tooltipService = useMachine(
  tooltip.machine,
  computed(() => ({
    id: tooltipId,
    ids: { trigger: api.value.getItemId("bold") },
    disabled: api.value.disabled,
  })),
)
const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button
        class="toolbar-icon-only"
        v-bind="mergeProps(tooltipApi.getTriggerProps(), api.getItemProps({ value: 'bold' }))"
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button class="toolbar-icon-only" v-bind="api.getItemProps({ value: 'italic' })" aria-label="Italic"><em>I</em></button>
      <button class="toolbar-icon-only" v-bind="api.getItemProps({ value: 'underline' })" aria-label="Underline"><u>U</u></button>
      <Teleport to="#teleports">
        <div v-if="tooltipApi.open" v-bind="tooltipApi.getPositionerProps()">
          <div v-bind="tooltipApi.getContentProps()">Bold</div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

