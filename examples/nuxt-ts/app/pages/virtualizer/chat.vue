<script setup lang="ts">
import type { StickToBottomDetails } from "@zag-js/dom-query/scroll"
import { mergeProps } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const lines = [
  "Short reply.",
  "A medium reply that wraps onto a second line in a narrow column.",
  "A long reply. ".repeat(8),
]
const createMessage = (id: number) => ({ id, text: `#${id} ${lines[Math.abs(id) % lines.length]}` })

const messages = ref(Array.from({ length: 2000 }, (_, index) => createMessage(index + 1)))
const streaming = ref(true)
const sticky = ref<StickToBottomDetails | null>(null)

const { virtualizer, ref: rootRef } = useListVirtualizer(() => ({
  count: messages.value.length,
  estimatedItemSize: 48,
  overscan: 6,
  preserveScrollAnchor: true,
  stickToEnd: true,
  onStickToEndChange: (details: StickToBottomDetails) => (sticky.value = details),
  indexToKey: (index: number) => messages.value[index].id,
  keyToIndex: (key: string | number) => Number(key) - messages.value[0].id,
}))

// the stream runs in the browser only, so it starts once mounted
onMounted(() => {
  watchEffect((onCleanup) => {
    if (!streaming.value) return
    const timer = setInterval(() => {
      const last = messages.value[messages.value.length - 1]
      messages.value = [...messages.value, createMessage(last.id + 1)]
    }, 700)
    onCleanup(() => clearInterval(timer))
  })
})

function loadOlder() {
  const first = messages.value[0].id
  messages.value = [...Array.from({ length: 20 }, (_, index) => createMessage(first - 20 + index)), ...messages.value]
}
</script>

<template>
  <main style="padding: 20px">
    <div style="display: flex; gap: 8px">
      <button @click="streaming = !streaming">{{ streaming ? "Pause" : "Stream" }}</button>
      <button @click="loadOlder">Load older</button>
    </div>
    <div style="position: relative; width: 360px; margin-top: 12px">
      <div
        :ref="rootRef"
        v-bind="mergeProps(virtualizer.getRootProps(), { style: { height: '400px', border: '1px solid #ccc' } })"
        aria-label="Messages"
      >
        <div v-bind="virtualizer.getContentProps()">
          <div
            v-for="item in virtualizer.getVirtualItems()"
            :key="item.key"
            v-bind="virtualizer.getItemProps(item)"
            data-testid="message"
          >
            <p style="margin: 0; padding: 8px 12px; border-bottom: 1px solid #eee">{{ messages[item.index].text }}</p>
          </div>
        </div>
      </div>
      <button
        v-if="sticky?.unseen"
        style="position: absolute; bottom: 12px; left: 50%; translate: -50% 0"
        @click="virtualizer.scrollToEnd({ behavior: 'smooth' })"
      >
        Jump to latest
      </button>
    </div>
    <pre>{{ JSON.stringify(sticky) }}</pre>
  </main>
</template>
