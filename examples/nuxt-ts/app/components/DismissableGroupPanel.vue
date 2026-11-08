<script setup lang="ts">
import { trackDismissableElement } from "@zag-js/dismissable"

const props = defineProps<{ id: string; label: string }>()

const open = ref(false)
const panelRef = ref<HTMLDivElement | null>(null)

const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

watchEffect(
  (onCleanup) => {
    if (!open.value) return
    const cleanup = trackDismissableElement(panelRef.value, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => (open.value = false),
    })
    onCleanup(cleanup)
  },
  { flush: "post" },
)
</script>

<template>
  <div>
    <button data-peer :data-testid="`trigger-${props.id}`" @click="open = !open">{{ props.label }}</button>
    <div
      ref="panelRef"
      data-peer
      :hidden="!open"
      role="dialog"
      :aria-label="props.label"
      :data-testid="`panel-${props.id}`"
      class="panel"
    >
      <slot />
    </div>
  </div>
</template>
