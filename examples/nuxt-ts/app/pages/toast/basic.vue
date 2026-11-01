<script lang="ts" setup>
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

const controls = useControls(toastControls)

const service = useMachine(toast.group.machine, controls.mergeProps<toast.GroupProps>({ id: useId(), store: toaster }))
const api = computed(() => toast.group.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="hstack">
      <button @click="toaster.create({ title: 'Event created', description: 'Sunday, December 3 at 9:00 AM' })">
        Show toast
      </button>
      <button @click="toaster.success({ title: 'Changes saved' })">Success</button>
      <button @click="toaster.error({ title: 'Couldn\'t save changes', description: 'Check your connection.' })">
        Error
      </button>
      <button @click="toaster.warning({ title: 'Storage almost full', description: '90% of 5 GB used.' })">
        Warning
      </button>
      <button @click="toaster.info({ title: 'A new version is available' })">Info</button>
      <button @click="toaster.loading({ title: 'Uploading files…' })">Loading</button>
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

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
