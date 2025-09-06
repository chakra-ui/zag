<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { VNodeRef } from "vue"
import { computed, mergeProps, ref, watch } from "vue"

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const present = computed(() => !attrs.hidden)
const service = useMachine(
  presence.machine,
  computed(() => ({ present: present.value })),
)
const api = computed(() => presence.connect(service, normalizeProps))

const nodeRef = ref<VNodeRef | null>(null)
watch(nodeRef, () => {
  if (nodeRef.value) {
    api.value.setNode(nodeRef.value)
  }
})

const mergedProps = computed(() =>
  mergeProps({ "data-scope": "presence" }, attrs, {
    hidden: !api.value.present,
    "data-state": api.value.skip ? undefined : present.value ? "open" : "closed",
    ref: nodeRef,
  }),
)
</script>

<template>
  <div v-bind="mergedProps">
    <slot />
  </div>
</template>
