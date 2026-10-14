<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const log = ref<boolean[]>([])

const service = useMachine(dialog.machine, {
  id: useId(),
  onOpenChange(details) {
    log.value = [...log.value, details.open]
  },
})

const api = computed(() => dialog.connect(service, normalizeProps))

function openThenClose() {
  api.value.setOpen(true)
  api.value.setOpen(false)
}

function closeThenOpen() {
  api.value.setOpen(false)
  api.value.setOpen(true)
}

function openRepeatedly() {
  for (let i = 0; i < 5; i++) api.value.setOpen(true)
}
</script>

<template>
  <main>
    <div data-testid="open-state">{{ String(api.open) }}</div>
    <div data-testid="open-change-log">{{ log.join(",") }}</div>

    <button data-testid="reset" @click="log = []">Reset log</button>

    <button data-testid="set-open" @click="api.setOpen(true)">setOpen(true)</button>

    <button data-testid="set-closed" @click="api.setOpen(false)">setOpen(false)</button>

    <button data-testid="open-then-close" @click="openThenClose">setOpen(true) then setOpen(false)</button>

    <button data-testid="close-then-open" @click="closeThenOpen">setOpen(false) then setOpen(true)</button>

    <button data-testid="open-repeatedly" @click="openRepeatedly">setOpen(true) five times</button>

    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()">Imperative control</h2>
          <p v-bind="api.getDescriptionProps()">Opened and closed through api.setOpen.</p>
          <button data-testid="content-set-closed" @click="api.setOpen(false)">setOpen(false)</button>
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
