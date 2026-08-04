<script setup lang="ts">
import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const props = defineProps<{ name: string; offset: number }>()

const service = useMachine(floatingPanel.machine, {
  id: useId(),
  defaultPosition: { x: 100 + props.offset, y: 100 + props.offset },
})

const api = computed(() => floatingPanel.connect(service, normalizeProps))
</script>

<template>
  <div>
    <button v-bind="api.getTriggerProps()" :data-testid="`trigger-${name}`">Toggle {{ name }}</button>
    <div v-bind="api.getPositionerProps()" :data-testid="`positioner-${name}`">
      <div v-bind="api.getContentProps()" :data-testid="`content-${name}`">
        <div v-bind="api.getDragTriggerProps()">
          <div v-bind="api.getHeaderProps()">
            <p v-bind="api.getTitleProps()">Panel {{ name }}</p>
            <div v-bind="api.getControlProps()">
              <button v-bind="api.getCloseTriggerProps()" :data-testid="`close-${name}`">
                <XIcon />
              </button>
            </div>
          </div>
        </div>
        <div v-bind="api.getBodyProps()">
          <p>Content {{ name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
