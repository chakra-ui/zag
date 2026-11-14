<script setup lang="ts">
import { getInlineRectCoords, getPlacement, getPlacementStyles, inline, type InlineRectCoords } from "@zag-js/popper"
import { onMounted, onBeforeUnmount, ref } from "vue"
import "@styles/popper.css"

const styles = getPlacementStyles({ placement: "top" })

const termRef = ref<HTMLAnchorElement | null>(null)
const cardRef = ref<HTMLDivElement | null>(null)
const open = ref(false)

let stop: VoidFunction | undefined
let coords: InlineRectCoords | undefined
let cleanup: VoidFunction | undefined
let removeClick: VoidFunction | undefined

function close() {
  stop?.()
  stop = undefined
  cleanup?.()
  cleanup = undefined
  open.value = false
}

onMounted(() => {
  const term = termRef.value
  const card = cardRef.value
  if (!term || !card) return

  const onPointerDown = (e: PointerEvent) => {
    if (!term.contains(e.target as Node) && !card.contains(e.target as Node)) close()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close()
  }

  const onClick = (e: MouseEvent) => {
    e.preventDefault()
    coords = getInlineRectCoords({ element: term, x: e.clientX, y: e.clientY })
    stop?.()
    cleanup?.()
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    cleanup = () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
    open.value = true
    stop = getPlacement(term, card, {
      placement: "top",
      gutter: 12,
      middleware: [inline({ getCoords: () => coords })],
    })
  }

  term.addEventListener("click", onClick)
  removeClick = () => term.removeEventListener("click", onClick)
})

onBeforeUnmount(() => {
  removeClick?.()
  close()
})
</script>

<template>
  <main>
    <div class="popper-inline">
      <p class="hint">Click either line of the link to anchor the card to that line.</p>
      <p class="article">
        Every plan includes a free trial, and annual subscriptions are
        <a ref="termRef" href="#refund-policy" class="term" data-testid="inline-term" aria-describedby="refund-card"
          >eligible for a full refund within 30 days of purchase</a
        >
        if the product is not a fit.
      </p>
      <div
        id="refund-card"
        ref="cardRef"
        class="card"
        role="tooltip"
        data-testid="inline-card"
        :data-open="open ? 'true' : 'false'"
        :style="styles.floating"
      >
        Refunded to your original payment method.
      </div>
    </div>
  </main>
</template>
