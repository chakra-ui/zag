<script lang="ts">
import * as splitter from "@zag-js/splitter"
import type { InjectionKey, ComputedRef } from "vue"

export const SplitterApiKey: InjectionKey<ComputedRef<splitter.Api>> = Symbol("SplitterApi") as any
</script>

<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId, provide } from "vue"

interface Props {
  orientation?: splitter.Props["orientation"]
  panels: splitter.Props["panels"]
  defaultSize?: splitter.Props["defaultSize"]
  registry?: splitter.Props["registry"]
}

const props = defineProps<Props>()

const service = useMachine(splitter.machine, { ...props, id: useId() })
const api = computed(() => splitter.connect(service, normalizeProps))

provide(SplitterApiKey, api)
</script>

<template>
  <div v-bind="api.getRootProps()">
    <slot :api="api" />
  </div>
</template>
