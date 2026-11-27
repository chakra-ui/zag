<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const archived = ref(false)
const failUndo = ref(false)
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function archiveMessage() {
  archived.value = true
  const fail = failUndo.value
  let undoing = false
  const id = toaster.create({
    title: "Message archived",
    action: {
      label: "Undo",
      onClick(event) {
        // keep the toast open while the undo runs
        event.preventDefault()
        if (undoing) return
        undoing = true
        toaster.pause(id)
        toaster.update(id, { title: "Undoing…" })
        wait(800).then(() => {
          undoing = false
          if (fail) {
            toaster.update(id, { title: "Couldn't undo. Try again." })
            toaster.resume(id)
            return
          }
          archived.value = false
          toaster.dismiss(id)
        })
      },
    },
  })
}
</script>

<template>
  <main>
    <p>{{ archived ? "Message archived" : "Message in inbox" }}</p>
    <label><input type="checkbox" v-model="failUndo" /> Fail the undo</label>
    <button :disabled="archived" @click="archiveMessage">Archive message</button>
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
