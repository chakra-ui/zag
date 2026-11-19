<script setup lang="ts">
import { autoresizeTextarea } from "@zag-js/auto-resize"
import { onMounted, onUnmounted, ref } from "vue"
import "@styles/autoresize.css"

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messages = ref(["Are we still on for 10?", "Yes, see you in the lobby"])
const draft = ref("")
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = autoresizeTextarea(textareaRef.value)
})

onUnmounted(() => {
  if (cleanup) cleanup()
})

function send() {
  if (!draft.value.trim()) return
  messages.value = [...messages.value, draft.value]
  draft.value = ""
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}
</script>

<template>
  <main>
    <div class="autoresize-chat-composer">
      <p class="hint">Shift+Enter adds a line, Enter sends. The box stops growing at five rows.</p>
      <ul class="messages" data-testid="messages">
        <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
      </ul>
      <form @submit.prevent="send">
        <textarea
          ref="textareaRef"
          rows="1"
          aria-label="Message"
          placeholder="Write a message"
          :value="draft"
          @input="draft = ($event.target as HTMLTextAreaElement).value"
          @keydown="onKeydown"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  </main>
</template>
