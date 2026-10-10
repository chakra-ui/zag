<script lang="ts" setup>
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import ToastItem from "../../components/ToastItem.vue"

const toaster = toast.createStore({ placement: "bottom-end", overlap: false })
const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

function upload(options: { reject?: boolean; description?: string } = {}) {
  const request = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (options.reject) reject(new Error("The upload failed. Try again."))
      else resolve("photo.png")
    }, 1200)
  })

  const result = toaster.promise(request, {
    loading: { title: "Uploading photo…", description: "Please wait." },
    success: (name) => ({ title: "Upload complete", description: `${name} is ready.` }),
    error: (error) => ({ title: "Upload failed", description: (error as Error).message }),
  })

  if (options.description !== undefined && result?.id) {
    toaster.create({ id: result.id, description: options.description })
  }
}
</script>

<template>
  <main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
    <h1>Promise toasts</h1>
    <p>Show a loading toast while uploading, then update it with the result.</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button @click="() => upload()">Upload successfully</button>
      <button @click="() => upload({ description: 'Sending photo.png…' })">Upload with progress message</button>
      <button @click="() => upload({ reject: true })">Fail upload</button>
      <button @click="() => toaster.dismiss()">Dismiss all</button>
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
