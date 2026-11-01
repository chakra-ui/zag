<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/collapsible.css"

const open = ref(true)

const id = useId()
const service = useMachine(
  collapsible.machine,
  computed(() => ({
    id,
    open: open.value,
    onOpenChange: (details) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <main class="collapsible">
    <h1>Collapsible Controlled</h1>
    <h1>{{ String(open) }}</h1>

    <div style="display: flex; gap: 12px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getContentProps()">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  </main>
</template>
