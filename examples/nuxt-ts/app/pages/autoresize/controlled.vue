<script setup lang="ts">
import { autoresizeTextarea } from "@zag-js/auto-resize"
import { onMounted, onUnmounted, ref } from "vue"

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const value = ref("")
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = autoresizeTextarea(textareaRef.value)
})

onUnmounted(() => {
  cleanup?.()
})

function onInput(e: Event) {
  const next = (e.target as HTMLTextAreaElement).value
  console.log("onChange fired:", next)
  value.value = next
}

function onClear() {
  console.log("Clear button clicked")
  value.value = ""
}
</script>

<template>
  <main style="padding: 20px; max-width: 600px">
    <h1>Autoresize Controlled Textarea</h1>
    <p>Test: Type a character, click Clear, then type the same character again. The onChange should fire each time.</p>

    <textarea
      ref="textareaRef"
      :value="value"
      rows="2"
      placeholder="Type something..."
      style="width: 100%; resize: none; padding: 12px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc"
      @input="onInput"
    />

    <div style="margin-top: 12px; display: flex; gap: 12px">
      <button style="padding: 8px 16px; font-size: 14px; cursor: pointer" @click="onClear">Clear the field</button>
    </div>

    <div style="margin-top: 20px">
      <strong>Value from state:</strong>
      <pre data-testid="value" style="background: #f5f5f5; padding: 12px; border-radius: 4px; min-height: 40px">{{
        JSON.stringify(value)
      }}</pre>
    </div>

    <div style="margin-top: 20px; color: #666; font-size: 14px">
      <strong>Instructions:</strong>
      <ol>
        <li>Type any single character (e.g., "a")</li>
        <li>Click "Clear the field" button</li>
        <li>Type the same character again</li>
        <li><strong>Expected:</strong> onChange fires, state updates to "a"</li>
        <li><strong>Bug (before fix):</strong> onChange doesn't fire, state stays empty</li>
      </ol>
      <p>Check the browser console for onChange logs.</p>
    </div>
  </main>
</template>
