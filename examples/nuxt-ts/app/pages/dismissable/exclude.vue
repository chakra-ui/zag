<script setup lang="ts">
import { trackDismissableElement } from "@zag-js/dismissable"
import "@styles/dismissable.css"

const sortOptions = ["Newest", "Price: low to high", "Rating"]

const open = ref(false)
const sort = ref(sortOptions[0])

const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)

watchEffect(
  (onCleanup) => {
    if (!open.value) return
    const cleanup = trackDismissableElement(panelRef.value, {
      exclude: [triggerRef.value, toolbarRef.value],
      onLayerChange: () => {},
      onDismiss: () => (open.value = false),
    })
    onCleanup(cleanup)
  },
  { flush: "post" },
)
</script>

<template>
  <main>
    <div class="exclude">
      <div ref="toolbarRef" role="toolbar" aria-label="Sort results" class="sort-bar">
        <button v-for="option in sortOptions" :key="option" :aria-pressed="sort === option" @click="sort = option">
          {{ option }}
        </button>
      </div>

      <button ref="triggerRef" @click="open = !open">Filters</button>

      <div ref="panelRef" :hidden="!open" role="dialog" aria-label="Filters" class="panel">
        <strong>Filter running shoes</strong>
        <label><input type="checkbox" /> In stock</label>
        <label><input type="checkbox" /> Free delivery</label>
      </div>

      <p role="status" class="status">Sorted by {{ sort }}</p>
      <p>Showing 24 results. Click here to close the filters.</p>
    </div>
  </main>
</template>
