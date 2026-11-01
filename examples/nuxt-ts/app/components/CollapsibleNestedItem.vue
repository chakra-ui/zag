<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

const props = withDefaults(defineProps<{ trigger: string; debug?: boolean; open?: boolean }>(), { open: undefined })

const id = useId()
const service = useMachine(
  collapsible.machine,
  computed(() => ({
    id,
    open: props.open,
  })),
)

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <button v-bind="api.getTriggerProps()">{{ trigger }}</button>
    <div v-bind="mergeProps(api.getContentProps(), { style: { background: 'red' } })">
      <slot />
    </div>
  </div>
  <Toolbar v-if="debug" viz style="position: fixed; top: 0; right: 0">
    <StateVisualizer :state="service" :omit="['stylesRef']" />
  </Toolbar>
</template>
