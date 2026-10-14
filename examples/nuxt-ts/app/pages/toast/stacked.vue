<script lang="ts" setup>
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({
  overlap: false,
  placement: "bottom",
  gap: 24,
})

const controls = useControls(toastControls)

const service = useMachine(
  toast.group.machine,
  controls.mergeProps<toast.GroupProps>({
    id: useId(),
    store: toaster,
  }),
)

const api = computed(() => toast.group.connect(service, normalizeProps))
const id = ref<string>()

const notifyLoading = () => {
  toaster.create({ title: "Fetching data...", type: "loading" })
}

const notifyError = () => {
  id.value = toaster.create({
    title: "Ooops! Something was wrong",
    type: "error",
    onStatusChange(details) {
      console.log(details)
    },
  })
}

const updateLatest = () => {
  if (!id.value) return
  toaster.update(id.value, { title: "Testing", type: "loading" })
}

const appendToLatest = () => {
  if (!id.value) return
  toaster.update(id.value, (prev) => ({ title: `${prev.title} (updated)` }))
}

const notifyPromise = () => {
  const promise = new Promise<{ name: string }>((resolve) => {
    setTimeout(() => resolve({ name: "Chakra" }), 3000)
  })

  toaster.promise(promise, {
    loading: { title: "Creating toast..." },
    success: (data) => ({ title: `${data.name} toast added` }),
    error: { title: "Error" },
  })
}

const createVNode = () => {
  toaster.create({
    type: "info",
    title: h("h1", { style: { color: "red" } }, "Hello"),
    description: h("p", "This is a description"),
  })
}
</script>

<template>
  <main>
    <ProfileDialog />
    <div style="display: flex; flex-wrap: wrap; gap: 16px; max-width: 640px">
      <button @click="notifyLoading">Notify (Loading)</button>
      <button @click="notifyError">Notify (Error)</button>
      <button @click="updateLatest">Update Latest</button>
      <button @click="appendToLatest">Append to Latest</button>
      <button class="toast-button" @click="notifyPromise">Promise</button>
      <button @click="createVNode">Create (JSX)</button>

      <button @click="toaster.dismiss()">Close all</button>
      <button @click="toaster.pause()">Pause all</button>
      <button @click="toaster.resume()">Resume all</button>
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
