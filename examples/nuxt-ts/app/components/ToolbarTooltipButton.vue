<script setup lang="ts">
import type * as toolbar from "@zag-js/toolbar"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ api: toolbar.Api; value: string; label: string }>()

const id = useId()
const service = useMachine(
  tooltip.machine,
  computed(() => ({
    id,
    ids: { trigger: props.api.getItemId(props.value) },
    disabled: props.api.disabled,
  })),
)
const tooltipApi = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <button
    class="toolbar-icon-only"
    v-bind="mergeProps(tooltipApi.getTriggerProps(), api.getItemProps({ value }))"
    :aria-label="label"
  >
    <slot />
  </button>
  <Teleport v-if="tooltipApi.open" to="#teleports">
    <div v-bind="tooltipApi.getPositionerProps()">
      <div v-bind="tooltipApi.getContentProps()">{{ label }}</div>
    </div>
  </Teleport>
</template>
