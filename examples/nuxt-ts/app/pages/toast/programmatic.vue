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
      <button @click="toaster.create({ title: 'Sync complete', description: 'All 24 files are up to date.' })">
        Show toast
      </button>
      <button @click="toaster.pause()">Pause all</button>
      <button @click="toaster.resume()">Resume all</button>
      <button @click="toaster.dismiss()">Dismiss all</button>
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
