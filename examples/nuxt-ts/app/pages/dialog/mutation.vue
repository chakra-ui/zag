<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

const nextContent = ref(false)

const service = useMachine(dialog.machine, { id: "1" })
const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Click me</button>
    <Teleport to="#teleports">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button v-if="!nextContent" @click="nextContent = true">Set next content</button>
          <button v-if="nextContent" @click="nextContent = false">Set previous content</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
