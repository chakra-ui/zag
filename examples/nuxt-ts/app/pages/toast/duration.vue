<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="hstack">
      <button @click="toaster.create({ title: 'Closes in 2 seconds', duration: 2000 })">2 seconds</button>
      <button @click="toaster.create({ title: 'Closes in 10 seconds', duration: 10000 })">10 seconds</button>
      <button @click="toaster.create({ title: 'Stays until dismissed', duration: Infinity })">Persistent</button>
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
