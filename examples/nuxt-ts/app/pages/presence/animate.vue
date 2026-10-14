<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/presence.css"

const open = ref(true)
const unmounted = ref(false)

const service = useMachine(
  presence.machine,
  computed<presence.Props>(() => ({
    present: open.value,
    onExitComplete() {
      unmounted.value = true
    },
  })),
)

const api = computed(() => presence.connect(service, normalizeProps))

const setNode = (node: unknown) => {
  if (node) api.value.setNode(node as HTMLElement)
}

const toggle = () => {
  unmounted.value = false
  open.value = !open.value
}
</script>

<template>
  <main style="min-width: 400px; padding: 40px; display: flex; flex-direction: column; gap: 1rem">
    <div>Open: {{ String(open) }}, Unmounted: {{ String(unmounted) }}</div>
    <button @click="toggle">Toggle</button>
    <!-- Kept mounted until the exit animation completes -->
    <div
      v-if="api.present"
      :ref="setNode"
      data-presence-root
      :hidden="!api.present"
      :data-state="api.skip ? undefined : open ? 'open' : 'closed'"
    >
      <div>Content</div>
    </div>
  </main>
</template>
