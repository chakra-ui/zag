<script lang="ts" setup>
import {
  getDismissableLayerAttrs,
  getDismissableLayerStyle,
  trackDismissableElement,
  type LayerSnapshot,
} from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"

const props = defineProps<{
  background: string
  id: string
  pointerBlocking?: boolean
}>()

const open = ref(false)
const layer = ref<LayerSnapshot | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

watchEffect((onCleanup) => {
  if (!open.value || !contentRef.value || !triggerRef.value) return
  const cleanups = [
    getPlacement(triggerRef.value, contentRef.value, { placement: "right" }),
    trackDismissableElement(contentRef.value, {
      pointerBlocking: props.pointerBlocking,
      onLayerChange: (snapshot) => (layer.value = snapshot),
      onDismiss: () => (open.value = false),
      exclude: [triggerRef.value],
    }),
  ]
  onCleanup(() => cleanups.forEach((cleanup) => cleanup()))
})
</script>

<template>
  <div style="padding: 40px">
    <button ref="triggerRef" :data-testid="`trigger-${id}`" @click="open = !open">Dismiss</button>
    <Teleport to="#teleports">
      <div
        ref="contentRef"
        :hidden="!open"
        :data-testid="`layer-${id}`"
        v-bind="getDismissableLayerAttrs(layer)"
        :style="{
          position: 'fixed',
          top: '0px',
          left: '0px',
          transform: 'translate3d(var(--x, 0px), var(--y, -100vh), 0)',
          // getPlacement() also writes to --z-index (copying the content's own
          // computed z-index), so use --layer-index directly to avoid the clash.
          zIndex: 'var(--layer-index)',
          background,
          padding: '10px',
          ...getDismissableLayerStyle(layer, { pointerEvents: true }),
        }"
      >
        <h1>Sandbox</h1>
        <p>This is a sandbox page.</p>
        <slot />
      </div>
    </Teleport>
  </div>
</template>
