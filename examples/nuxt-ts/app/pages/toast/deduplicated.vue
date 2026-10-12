<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import ToastItem from "../../components/ToastItem.vue"

const toaster = toast.createStore<string>({ placement: "bottom-end", overlap: false, duration: Infinity })
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function saveDraft() {
  if (!toaster.isVisible("draft")) {
    toaster.create({ id: "draft", title: "Draft saved", description: "Saved 1 time.", meta: { saves: 1 } })
    return
  }

  toaster.update("draft", (prev) => {
    const saves = (prev.meta?.saves ?? 0) + 1

    return {
      description: `Saved ${saves} times.`,
      meta: { saves },
    }
  })
}
</script>

<template>
  <main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
    <h1>Deduplicated toasts</h1>
    <p>Repeated saves update one persistent toast. Close it, then save again to start a new count.</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button @click="saveDraft">Save draft</button>
      <button @click="() => toaster.dismiss('draft')">Dismiss draft</button>
    </div>
    <Teleport to="#teleports">
      <div v-bind="api.getGroupProps()">
        <ToastItem
          v-for="(actor, index) in api.getToasts()"
          :key="actor.id"
          :actor="actor"
          :index="index"
          :parent="service"
        />
      </div>
    </Teleport>
  </main>
</template>
