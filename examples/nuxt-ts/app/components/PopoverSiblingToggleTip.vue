<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"

const open = ref(false)

watch(open, (isOpen, _, onCleanup) => {
  if (!isOpen) return
  const timer = setTimeout(() => {
    open.value = false
  }, 2000)
  onCleanup(() => clearTimeout(timer))
})

const id = useId()

const service = useMachine(
  popover.machine,
  computed<popover.Props>(() => ({
    id,
    open: open.value,
    onOpenChange(details) {
      open.value = details.open
    },
    closeOnInteractOutside: false,
    restoreFocus: false,
  })),
)

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <div style="display: inline-block">
    <button data-testid="toggletip-trigger" v-bind="api.getTriggerProps()">ℹ Info</button>
    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence data-testid="toggletip-content" class="popover-content" v-bind="api.getContentProps()">
          <div v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>
          <div v-bind="api.getTitleProps()">Toggle Tip</div>
          <div data-part="body">This is some additional information. It will close in 2 seconds.</div>
        </Presence>
      </div>
    </Teleport>
  </div>
</template>
