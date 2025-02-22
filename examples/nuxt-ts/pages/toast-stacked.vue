<script lang="ts" setup>
import { toastControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toast from "@zag-js/toast"
import ToastItem from "../components/ToastItem.vue"

const controls = useControls(toastControls)

const toaster = toast.createStore({
  placement: "bottom",
  overlap: false,
})

const service = useMachine(toast.group.machine, {
  id: useId(),
  store: toaster,
})

const api = computed(() => toast.group.connect(service, normalizeProps))
const id = ref<string>()
</script>

<template>
  <main>
    <div style="display: flex; gap: 16px">
      <button
        @click="
          () => {
            toaster.create({
              title: 'Fetching data...',
              type: 'loading',
            })
          }
        "
      >
        Notify (Loading)
      </button>
      <button @click="() => toaster.expand()">Expand</button>
      <button
        @click="
          () => {
            id = toaster.create({
              title: 'Ooops! Something was wrong',
              type: 'error',
            })
          }
        "
      >
        Notify (Error)
      </button>
      <button
        @click="
          () => {
            if (!id) return
            toaster.update(id, {
              title: 'Testing',
              type: 'loading',
            })
          }
        "
      >
        Update Latest
      </button>
      <button @click="() => toaster.dismiss()">Close all</button>
      <button @click="() => toaster.pause()">Pause all</button>
      <button @click="() => toaster.resume()">Resume all</button>
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getGroupProps()">
        <ToastItem
          v-for="(toast, index) in api.getToasts()"
          :key="toast.id"
          :actor="toast"
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
