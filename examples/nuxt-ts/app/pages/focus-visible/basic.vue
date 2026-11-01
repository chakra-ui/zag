<script setup lang="ts">
import { trackFocusVisible } from "@zag-js/focus-visible"

const focusVisible = ref(false)
const buttonFocused = ref(false)
const checkboxFocused = ref(false)

onMounted(() => {
  const cleanup = trackFocusVisible({
    onChange(details) {
      focusVisible.value = details.isFocusVisible
    },
  })
  onBeforeUnmount(cleanup)
})

const buttonRing = computed(() => focusVisible.value && buttonFocused.value)
const checkboxRing = computed(() => focusVisible.value && checkboxFocused.value)
</script>

<template>
  <div style="padding: 40px">
    <button
      :style="{ background: buttonRing ? 'red' : undefined }"
      @focus="buttonFocused = true"
      @blur="buttonFocused = false"
    >
      Click me
    </button>

    <br />
    <br />

    <label :style="{ background: checkboxRing ? 'red' : undefined }">
      <input type="checkbox" @focus="checkboxFocused = true" @blur="checkboxFocused = false" />
      <span>Focus me</span>
    </label>
  </div>
</template>
