<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

const dialogService = useMachine(dialog.machine, { id: useId() })
const dialogApi = computed(() => dialog.connect(dialogService, normalizeProps))

const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="dialogApi.getTriggerProps()">Edit profile</button>
    <Teleport v-if="dialogApi.open" to="#teleports">
      <div v-bind="dialogApi.getBackdropProps()" />
      <div v-bind="dialogApi.getPositionerProps()">
        <div v-bind="dialogApi.getContentProps()">
          <h2 v-bind="dialogApi.getTitleProps()">Edit profile</h2>
          <p v-bind="dialogApi.getDescriptionProps()">Saving shows a toast while the dialog stays open.</p>
          <button @click="toaster.success({ title: 'Profile saved' })">Save</button>
          <button v-bind="dialogApi.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>
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
