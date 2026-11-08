<script setup lang="ts">
import { trackDismissableElement } from "@zag-js/dismissable"

const props = defineProps<{ id: string; label: string; open: boolean }>()
const emit = defineEmits<{ dismiss: [] }>()

const panelRef = ref<HTMLDivElement | null>(null)

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

watchEffect(
  (onCleanup) => {
    if (!props.open) return
    const cleanup = trackDismissableElement(panelRef.value, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => emit("dismiss"),
    })
    onCleanup(cleanup)
  },
  { flush: "post" },
)
</script>

<template>
  <div
    ref="panelRef"
    data-peer
    :hidden="!props.open"
    role="dialog"
    :aria-label="props.label"
    :data-testid="`panel-${props.id}`"
    class="panel"
  >
    <slot />
  </div>
</template>
