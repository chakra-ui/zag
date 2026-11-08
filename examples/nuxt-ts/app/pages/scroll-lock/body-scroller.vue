<script setup lang="ts">
import { preventBodyScroll } from "@zag-js/remove-scroll"
import "@styles/scroll-lock.css"

const open = ref(false)

watchEffect((onCleanup) => {
  if (!open.value) return
  onCleanup(preventBodyScroll())
})
</script>

<template>
  <main>
    <div class="body-scroller">
      <p class="hint">Scroll the page, then open the filters and try again. The lock lands on body.</p>
      <button data-testid="open-panel" @click="open = true">Open filters</button>

      <template v-if="open">
        <div class="backdrop" />
        <div class="panel" role="dialog" aria-modal="true" aria-label="Filters" data-testid="panel">
          <span class="panel-title">Filters</span>
          <p>Narrow the results by price, brand and rating.</p>
          <button data-testid="close-panel" @click="open = false">Show 24 results</button>
        </div>
      </template>
    </div>
  </main>
</template>
