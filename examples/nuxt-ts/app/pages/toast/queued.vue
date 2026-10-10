<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import ToastItem from "../../components/ToastItem.vue"

const toaster = toast.createStore<string>({
  max: 2,
  duration: Infinity,
  placement: "bottom-end",
  overlap: false,
})

const started = ref(false)
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function start() {
  toaster.create({ id: "first", title: "Toast 1", description: "Dismiss me to make room for the waiting toast." })
  toaster.create({ id: "second", title: "Toast 2", description: "Only two toasts can be visible at once." })
  toaster.create({ id: "waiting", title: "Toast 3", description: "I waited for a free slot.", meta: { updates: 0 } })
  started.value = true
}

function updateWaiting() {
  for (let i = 0; i < 2; i++) {
    toaster.update("waiting", (prev) => {
      const updates = (prev.meta?.updates ?? 0) + 1

      return {
        title: `Toast 3 (updated ${updates} times)`,
        meta: { updates },
      }
    })
  }
}

function dismissOldest() {
  const oldest = toaster.getVisibleToasts().at(-1)
  if (oldest?.id) toaster.dismiss(oldest.id)
}

function reset() {
  toaster.remove()
  started.value = false
}
</script>

<template>
  <main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
    <h1>Queued toasts</h1>
    <p>Show three persistent toasts with a visible limit of two. The third waits until a visible toast closes.</p>

    <ol>
      <li>Create three toasts. Only Toast 1 and Toast 2 should appear.</li>
      <li>Update the waiting toast. Each click applies two consecutive updates without showing it.</li>
      <li>Dismiss the oldest visible toast. Toast 3 should appear with its latest update count.</li>
    </ol>

    <p>
      To test cancellation, reset, create three toasts, and dismiss the waiting toast before closing the visible ones.
    </p>

    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button :disabled="started" @click="start">Create three toasts</button>
      <button :disabled="!started" @click="updateWaiting">Update waiting toast</button>
      <button :disabled="!started" @click="() => toaster.dismiss('waiting')">Dismiss waiting toast</button>
      <button :disabled="!started" @click="dismissOldest">Dismiss oldest visible toast</button>
      <button @click="reset">Reset</button>
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
