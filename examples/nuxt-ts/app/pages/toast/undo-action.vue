<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import ToastItem from "../../components/ToastItem.vue"

const toaster = toast.createStore<string>({ placement: "bottom-end", duration: 10000 })
const saved = ref(true)
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function removeBookmark() {
  saved.value = false
  toaster.create({
    title: "Bookmark removed",
    description: "Undo to put it back in your reading list.",
    action: {
      label: "Undo",
      onClick() {
        saved.value = true
        toaster.create({ title: "Bookmark restored", type: "success" })
      },
    },
  })
}
</script>

<template>
  <main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
    <h1>Undo action</h1>
    <p>Remove a bookmark, then use Undo in the notification to restore it.</p>
    <section>
      <h2>Designing accessible notifications</h2>
      <p role="status">{{ saved ? "Saved to reading list" : "Removed from reading list" }}</p>
      <button :disabled="!saved" @click="removeBookmark">Remove bookmark</button>
    </section>
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
