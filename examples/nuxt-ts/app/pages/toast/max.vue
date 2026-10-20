<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", max: 2, duration: Infinity })

function updateWaiting() {
  for (let i = 0; i < 2; i++) {
    toaster.update("waiting", (prev) => {
      const updates = (prev.meta?.updates ?? 0) + 1
      return { title: `Toast 3 (updated ${updates} times)`, meta: { updates } }
    })
  }
}

function dismissOldest() {
  const oldest = toaster.getVisibleToasts().at(-1)
  if (oldest?.id) toaster.dismiss(oldest.id)
}

const started = ref(false)
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function start() {
  toaster.create({ id: "first", title: "Toast 1" })
  toaster.create({ id: "second", title: "Toast 2" })
  toaster.create({ id: "waiting", title: "Toast 3", description: "Waited for a free slot.", meta: { updates: 0 } })
  started.value = true
}

function reset() {
  toaster.remove()
  started.value = false
}
</script>

<template>
  <main>
    <div class="hstack">
      <button :disabled="started" @click="start">Create three toasts</button>
      <button :disabled="!started" @click="updateWaiting">Update waiting toast</button>
      <button :disabled="!started" @click="toaster.dismiss('waiting')">Dismiss waiting toast</button>
      <button :disabled="!started" @click="dismissOldest">Dismiss oldest</button>
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
