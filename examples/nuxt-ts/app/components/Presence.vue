<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { HTMLAttributes, VNodeRef } from "vue"
import { computed, ref, watch } from "vue"

interface Props extends HTMLAttributes {}

const props = withDefaults(defineProps<Props>(), {
  hidden: false,
})

const present = computed(() => !props.hidden)
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
</script>

<template>
  <div
    ref="nodeRef"
    data-scope="presence"
    :data-state="api.skip ? undefined : present ? 'open' : 'closed'"
    :hidden="!api.present"
  >
    <slot />
  </div>
</template>
