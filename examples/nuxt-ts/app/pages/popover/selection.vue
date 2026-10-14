<script setup lang="ts">
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/popover.css"

const divRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

const service = useMachine(popover.machine, {
  id: useId(),
  autoFocus: false,
  positioning: {
    placement: "top",
    getAnchorRect() {
      const selection = divRef.value?.ownerDocument.getSelection()
      if (!selection?.rangeCount) return null
      const range = selection.getRangeAt(0)
      return range.getBoundingClientRect()
    },
  },
})

const api = computed(() => popover.connect(service, normalizeProps))

function hasSelectionWithin(el?: Element | null) {
  if (!el) return false

  const selection = el.ownerDocument.getSelection()
  if (!selection?.rangeCount) return false

  const range = selection.getRangeAt(0)
  if (range.collapsed) return false

  return !!el.contains(range.commonAncestorContainer)
}

onMounted(() => {
  const content = contentRef.value
  const node = divRef.value

  if (!content) return
  if (!node) return

  const doc = node.ownerDocument || document

  const onMouseUp = () => {
    if (!hasSelectionWithin(node)) return
    api.value.reposition()
    api.value.setOpen(true)
  }

  const onSelect = () => {
    if (hasSelectionWithin(node)) {
      return api.value.reposition()
    }
    api.value.setOpen(false)
  }

  doc.addEventListener("mouseup", onMouseUp)
  doc.addEventListener("selectionchange", onSelect)

  onBeforeUnmount(() => {
    doc.removeEventListener("mouseup", onMouseUp)
    doc.removeEventListener("selectionchange", onSelect)
  })
})
</script>

<template>
  <main class="popover">
    <div ref="divRef" style="max-width: 500px; font-size: 20px">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga necessitatibus aliquid expedita atque?
      Doloremque ea sequi totam laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam, beatae maxime.
    </div>
    <div data-part="root">
      <div v-bind="api.getPositionerProps()">
        <div ref="contentRef" data-testid="popover-content" class="popover-content" v-bind="api.getContentProps()">
          <div v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>
          <button>Save</button>
          <button>Cancel</button>
          <button>Share</button>
        </div>
      </div>
    </div>
  </main>
</template>
