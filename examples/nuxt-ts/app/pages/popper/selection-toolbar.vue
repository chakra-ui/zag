<script setup lang="ts">
import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { onMounted, onBeforeUnmount, ref } from "vue"
import "@styles/popper.css"

const styles = getPlacementStyles({ placement: "top", strategy: "fixed" })

const paragraphRef = ref<HTMLParagraphElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)
const open = ref(false)
const status = ref("")

let stop: VoidFunction | undefined
let removeListener: VoidFunction | undefined

function close() {
  stop?.()
  stop = undefined
  open.value = false
}

onMounted(() => {
  const paragraph = paragraphRef.value
  const toolbar = toolbarRef.value
  if (!paragraph || !toolbar) return

  const onSelectionChange = () => {
    const selection = document.getSelection()
    const inside =
      selection &&
      !selection.isCollapsed &&
      selection.rangeCount > 0 &&
      paragraph.contains(selection.anchorNode) &&
      paragraph.contains(selection.focusNode)
    if (!inside) return close()

    const range = selection.getRangeAt(0).cloneRange()
    stop?.()
    open.value = true
    stop = getPlacement(null, toolbar, {
      placement: "top",
      strategy: "fixed",
      gutter: 14,
      getAnchorElement: () => ({
        contextElement: paragraph,
        getBoundingClientRect: () => range.getBoundingClientRect(),
      }),
    })
  }

  document.addEventListener("selectionchange", onSelectionChange)
  removeListener = () => document.removeEventListener("selectionchange", onSelectionChange)
})

onBeforeUnmount(() => {
  removeListener?.()
  stop?.()
})
</script>

<template>
  <main>
    <div class="popper-selection">
      <p class="hint">Select any words to open the toolbar above them.</p>
      <p ref="paragraphRef" class="article">
        Zag state machines keep interaction logic out of your components. Each machine describes the states a widget can
        be in, the events that move it between them, and the effects it runs along the way, so the same behavior works
        in every framework.
      </p>
      <div
        ref="toolbarRef"
        class="format-bar"
        role="toolbar"
        tabindex="-1"
        aria-label="Text formatting"
        :data-open="open ? 'true' : 'false'"
        :style="styles.floating"
        @mousedown.prevent
      >
        <button
          v-for="label in ['Bold', 'Link', 'Comment']"
          :key="label"
          type="button"
          @click="status = `${label} applied`"
        >
          {{ label }}
        </button>
      </div>
      <p class="status" role="status">{{ status }}</p>
    </div>
  </main>
</template>
