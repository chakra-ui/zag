<script setup lang="ts">
import { type IframeHTMLAttributes, type VNode, ref, watch } from "vue"

const frameRef = ref<HTMLIFrameElement | null>(null)
const mountNode = ref<HTMLElement | null>(null)

function getMountNode(frame: HTMLIFrameElement) {
  const doc = frame.contentWindow?.document
  if (!doc) return null
  return doc.body.querySelector<HTMLElement>(".frame-root") || doc.body
}

watch(frameRef, (node) => {
  if (!node) return

  const doc = node.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(
    '<html><head><style>*,*::before,*::after { margin: 0; padding: 0; box-sizing: border-box; }</style></head><body><div class="frame-root"></div></body></html>',
  )
  doc.close()

  mountNode.value = getMountNode(node)
})

watch(
  () => [frameRef.value, mountNode.value] as const,
  ([frameNode, mountNode], _oldValue, onCleanup) => {
    if (!frameNode || !frameNode.contentDocument) return

    const win = frameNode.contentWindow as Window & typeof globalThis
    if (!win) return

    const exec = () => {
      const rootEl = frameNode.contentDocument?.documentElement
      if (!rootEl || !mountNode) return
      frameNode.style.setProperty("--width", `${mountNode.scrollWidth}px`)
      frameNode.style.setProperty("--height", `${mountNode.scrollHeight}px`)
    }

    const resizeObserver = new win.ResizeObserver(exec)
    exec()

    if (mountNode) {
      resizeObserver.observe(mountNode)
    }

    onCleanup(() => {
      resizeObserver.disconnect()
    })
  },
)

const env = () => frameRef.value?.contentDocument ?? document
</script>

<template>
  <iframe ref="frameRef" v-bind="$attrs">
    <Teleport v-if="mountNode" :to="mountNode">
      <slot />
    </Teleport>
  </iframe>
</template>
