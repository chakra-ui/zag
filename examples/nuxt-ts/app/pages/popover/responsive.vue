<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/popover.css"

const dataAttr = (el: HTMLElement, key: string, value: boolean) => {
  if (value) el.dataset[key] = ""
  else delete el.dataset[key]
}

const isMdDown = () => window.matchMedia("(max-width: 640px)").matches

const service = useMachine(popover.machine, {
  id: useId(),
  positioning: {
    updatePosition({ updatePosition, floatingElement }) {
      const positionerEl = floatingElement as HTMLElement
      const contentEl = positionerEl.firstElementChild as HTMLElement

      dataAttr(positionerEl, "fullscreen", isMdDown())
      dataAttr(contentEl, "fullscreen", isMdDown())

      updatePosition()
    },
  },
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <div class="App">
    <main>
      <button v-bind="api.getTriggerProps()">Click me</button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getTitleProps()">Presenters</div>
            <div v-bind="api.getDescriptionProps()">Description</div>
            <button>Action Button</button>
            <button v-bind="api.getCloseTriggerProps()">
              <XIcon />
            </button>
          </div>
        </div>
      </Teleport>
    </main>
  </div>
</template>
