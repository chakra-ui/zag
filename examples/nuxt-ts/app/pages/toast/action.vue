<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })

const saved = ref(true)
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function removeBookmark() {
  saved.value = false
  toaster.create({
    title: "Bookmark removed",
    action: {
      label: "Undo",
      onClick: () => (saved.value = true),
    },
  })
}
</script>

<template>
  <main>
    <p>{{ saved ? "Saved to reading list" : "Removed from reading list" }}</p>
    <button :disabled="!saved" @click="removeBookmark">Remove bookmark</button>
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
