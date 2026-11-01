<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/popover.css"

const open = ref(false)

const id = useId()

const service = useMachine(
  popover.machine,
  computed<popover.Props>(() => ({
    id,
    onOpenChange: (details) => {
      open.value = details.open
    },
    open: open.value,
  })),
)

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Click me</button>
    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getTitleProps()">Presenters</div>
          <div v-bind="api.getDescriptionProps()">Description</div>
          <button @click="open = false">Action Button</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>
