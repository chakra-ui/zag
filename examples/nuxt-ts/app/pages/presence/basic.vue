<script lang="ts" setup>
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/presence.css"

const present = ref(false)

const service = useMachine(
  presence.machine,
  computed<presence.Props>(() => ({
    present: present.value,
    onEnterComplete() {
      console.log("enter complete")
    },
    onExitComplete() {
      console.log("exit complete")
    },
  })),
)

const api = computed(() => presence.connect(service, normalizeProps))

const setNode = (node: unknown) => {
  if (node) api.value.setNode(node as HTMLElement)
}
</script>

<template>
  <main class="presence">
    <button @click="present = !present">Toggle</button>
    <div
      v-if="api.present"
      :ref="setNode"
      data-scope="presence"
      :data-state="api.skip ? undefined : present ? 'open' : 'closed'"
    >
      Content
    </div>
  </main>
</template>
