<script lang="ts" setup>
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", overlap: false })

const messages = [
  { title: "Message sent", description: "Your message to Ada was delivered." },
  { title: "File uploaded" },
  { title: "Invite accepted", description: "Grace joined the design team and can now edit shared files." },
]

let count = 0

const controls = useControls(toastControls)

const service = useMachine(toast.group.machine, controls.mergeProps<toast.GroupProps>({ id: useId(), store: toaster }))
const api = computed(() => toast.group.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button @click="toaster.create(messages[count++ % messages.length]!)">Show toast</button>
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

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
