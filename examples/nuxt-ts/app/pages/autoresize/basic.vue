<script setup lang="ts">
import { autoresizeTextarea } from "@zag-js/auto-resize"
import { onMounted, onUnmounted, ref } from "vue"

const textareaRef = ref<HTMLTextAreaElement | null>(null)
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = autoresizeTextarea(textareaRef.value)
})

onUnmounted(() => {
  cleanup?.()
})
</script>

<template>
  <main>
    <textarea
      ref="textareaRef"
      rows="4"
      style="width: 100%; resize: none; padding: 20px; scroll-padding-block: 20px; max-height: 180px"
    />
  </main>
</template>
