<script setup lang="ts">
import { autoResizeInput } from "@zag-js/auto-resize"
import { onMounted, onUnmounted, ref } from "vue"
import "@styles/autoresize.css"

const inputRef = ref<HTMLInputElement | null>(null)
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = autoResizeInput(inputRef.value)
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<template>
  <main>
    <div class="autoresize-input-width">
      <label>
        <span>Board name</span>
        <input ref="inputRef" value="Roadmap" spellcheck="false" />
      </label>
    </div>
  </main>
</template>
