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
      <p class="hint">Open the filters, then try scrolling the page behind them.</p>
      <button @click="open = true">Open filters</button>

      <template v-if="open">
        <div class="backdrop" />
        <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
          <span class="panel-title">Filters</span>
          <p>Narrow the results by price, brand and rating.</p>
          <button @click="open = false">Show 24 results</button>
        </div>
      </template>
    </div>
  </main>
</template>
