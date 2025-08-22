<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { VNodeRef } from "vue"
import { watch } from "vue"

const present = ref(false)
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
  <main class="presence">
    <button @click="present = !present">Toggle</button>
    <div v-if="api.present" ref="nodeRef" data-scope="presence" :data-state="present ? 'open' : 'closed'">Content</div>
  </main>
</template>
