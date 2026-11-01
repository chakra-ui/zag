<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function saveDraft() {
  if (!toaster.isVisible("draft")) {
    toaster.create({ id: "draft", title: "Draft saved", description: "Saved 1 time.", meta: { saves: 1 } })
    return
  }

  toaster.update("draft", (prev) => {
    const saves = (prev.meta?.saves ?? 0) + 1
    return { description: `Saved ${saves} times.`, meta: { saves } }
  })
}
</script>

<template>
  <main>
    <div class="hstack">
      <button @click="saveDraft">Save draft</button>
      <button @click="toaster.dismiss('draft')">Dismiss</button>
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
