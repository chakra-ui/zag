<script setup lang="ts">
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/presence.css"

const present = ref(true)

const service = useMachine(
  presence.machine,
  computed<presence.Props>(() => ({ present: present.value })),
)
const api = computed(() => presence.connect(service, normalizeProps))

const setNode = (node: unknown) => {
  if (node) api.value.setNode(node as HTMLElement)
}
</script>

<template>
  <main>
    <div class="presence-reduced-motion">
      <p class="hint">With reduced motion on, the CSS drops the exit animation and the details unmount right away.</p>
      <button type="button" @click="present = !present">{{ present ? "Hide details" : "Show details" }}</button>
      <div
        v-if="api.present"
        :ref="setNode"
        class="details"
        data-testid="order-details"
        :data-state="api.skip ? undefined : present ? 'open' : 'closed'"
      >
        <strong>Order #1042</strong>
        <p>2 items · Ships Thursday · Paid with Visa •••• 4242</p>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
