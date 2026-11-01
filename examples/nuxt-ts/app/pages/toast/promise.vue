<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

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
  <main>
    <div class="hstack">
      <button @click="upload()">Upload</button>
      <button @click="upload({ description: 'Sending photo.png…' })">Upload with message</button>
      <button @click="upload({ reject: true })">Fail upload</button>
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
