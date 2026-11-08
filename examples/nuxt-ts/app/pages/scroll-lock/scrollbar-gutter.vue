<script setup lang="ts">
import { preventBodyScroll } from "@zag-js/remove-scroll"
import "@styles/scroll-lock.css"

const locked = ref(false)

watchEffect((onCleanup) => {
  if (!locked.value) return
  onCleanup(preventBodyScroll())
})
</script>

<template>
  <main>
    <div class="scrollbar-gutter">
      <div class="header" data-testid="header">Northwind Design</div>
      <p class="hint">Lock scrolling and watch the header keep its width.</p>
      <button data-testid="toggle-lock" :aria-pressed="locked" @click="locked = !locked">
        {{ locked ? "Unlock scrolling" : "Lock scrolling" }}
      </button>
    </div>
  </main>
</template>
