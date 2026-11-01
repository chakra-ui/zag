<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const route = useRoute()
const router = useRouter()

const showDialog = computed(() => route.query["show-dialog"] === "true")

const setShowDialog = (open: boolean) => {
  router.push(`${route.path}?show-dialog=${open}`)
}

const id = useId()
const service = useMachine(
  dialog.machine,
  computed(() => ({
    id,
    open: showDialog.value,
    onOpenChange(details) {
      setShowDialog(details.open)
    },
  })),
)

const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>Dialog Search Params</h1>
    <h1>{{ String(showDialog) }}</h1>

    <button @click="setShowDialog(true)">Open</button>
    <button @click="setShowDialog(false)">Close</button>

    <button v-bind="api.getTriggerProps()">Open Dialog</button>
    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Edit profile</h2>
          <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>
          <div>
            <input placeholder="Enter name..." />
            <button>Save</button>
          </div>
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
