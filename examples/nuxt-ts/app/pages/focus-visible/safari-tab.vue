<script setup lang="ts">
import { getInteractionModality, trackFocusVisible, type Modality } from "@zag-js/focus-visible"

const modality = ref<Modality | null>(null)
const focusVisible = ref(false)
const focused = ref(false)

onMounted(() => {
  modality.value = getInteractionModality()
  const cleanup = trackFocusVisible({
    onChange(details) {
      focusVisible.value = details.isFocusVisible
      modality.value = details.modality
    },
  })
  onBeforeUnmount(cleanup)
})

const showRing = computed(() => focusVisible.value && focused.value)
const verdict = computed(() =>
  !focused.value ? "click the button first" : showRing.value ? "FAIL — stray ring" : "PASS — no ring",
)
</script>

<template>
  <main style="font-family: ui-sans-serif, system-ui; padding: 32px; max-width: 640px; line-height: 1.5">
    <h1 style="font-size: 22px; margin: 0 0 8px">Safari tab-return focus ring</h1>
    <p style="margin: 0 0 20px; color: #444">
      Click the button with the mouse or trackpad. Switch to another Safari tab, then come back. A pointer click must
      not leave a keyboard ring.
    </p>

    <button
      type="button"
      :style="{
        fontSize: '18px',
        padding: '12px 20px',
        border: '2px solid #111',
        borderRadius: '8px',
        background: showRing ? '#ffb3b3' : '#f4f4f4',
        outline: showRing ? '4px solid crimson' : 'none',
        outlineOffset: '4px',
      }"
      @focus="focused = true"
      @blur="focused = false"
    >
      Click me, then switch tabs
    </button>

    <dl
      style="
        margin-top: 24px;
        padding: 16px;
        background: #f6f6f6;
        border-radius: 8px;
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 6px 16px;
      "
    >
      <dt>modality</dt>
      <dd style="margin: 0">{{ modality ?? "null" }}</dd>
      <dt>focus-visible</dt>
      <dd style="margin: 0">{{ String(focusVisible) }}</dd>
      <dt>button focused</dt>
      <dd style="margin: 0">{{ String(focused) }}</dd>
      <dt>ring</dt>
      <dd :style="{ margin: 0, fontWeight: 700, color: showRing ? 'crimson' : 'seagreen' }">{{ verdict }}</dd>
    </dl>
  </main>
</template>
