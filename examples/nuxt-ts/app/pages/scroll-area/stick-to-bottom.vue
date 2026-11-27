<script setup lang="ts">
import { trackStickToBottom, type StickToBottom, type StickToBottomDetails } from "@zag-js/dom-query/scroll"
import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/scroll-area.css"

const createMessage = (id: number) => ({ id, text: `Message ${id}` })

const messages = ref(Array.from({ length: 20 }, (_, index) => createMessage(index + 1)))
const streaming = ref(true)
const sticky = ref<StickToBottomDetails>({ following: true, atBottom: true, unseen: false })

const service = useMachine(scrollArea.machine, { id: useId() })
const api = computed(() => scrollArea.connect(service, normalizeProps))

const viewportEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
let tracker: StickToBottom | null = null

// the stream runs in the browser only, so it starts once mounted
onMounted(() => {
  watchEffect((onCleanup) => {
    if (!streaming.value) return
    const timer = setInterval(() => {
      const last = messages.value[messages.value.length - 1]
      messages.value = [...messages.value, createMessage(last.id + 1)]
    }, 800)
    onCleanup(() => clearInterval(timer))
  })
})

onMounted(() => {
  if (!viewportEl.value) return
  tracker = trackStickToBottom(viewportEl.value, {
    content: contentEl.value,
    onChange: (details) => (sticky.value = details),
  })
})
onBeforeUnmount(() => tracker?.cleanup())

function loadOlder() {
  const first = messages.value[0].id
  messages.value = [...Array.from({ length: 5 }, (_, index) => createMessage(first - 5 + index)), ...messages.value]
}
</script>

<template>
  <main class="scroll-area">
    <div style="display: flex; gap: 8px">
      <button @click="streaming = !streaming">{{ streaming ? "Pause" : "Stream" }}</button>
      <button @click="loadOlder">Load older</button>
    </div>
    <div v-bind="api.getRootProps()" style="height: 320px; position: relative">
      <div ref="viewportEl" v-bind="api.getViewportProps()" :data-following="sticky.following || undefined">
        <div ref="contentEl" v-bind="api.getContentProps()">
          <p v-for="message in messages" :key="message.id" data-testid="message">{{ message.text }}</p>
        </div>
      </div>
      <div v-if="api.hasOverflowY" v-bind="api.getScrollbarProps({ orientation: 'vertical' })">
        <div v-bind="api.getThumbProps({ orientation: 'vertical' })" />
      </div>
      <button
        v-if="sticky.unseen"
        style="position: absolute; bottom: 12px; left: 50%; translate: -50% 0"
        @click="tracker?.scrollToBottom({ behavior: 'smooth' })"
      >
        Jump to latest
      </button>
    </div>
  </main>

  <Toolbar>
    <pre>{{ JSON.stringify(sticky, null, 2) }}</pre>
  </Toolbar>
</template>
