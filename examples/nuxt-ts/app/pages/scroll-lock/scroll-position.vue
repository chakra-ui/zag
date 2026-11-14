<script setup lang="ts">
import { preventBodyScroll } from "@zag-js/remove-scroll"
import "@styles/scroll-lock.css"

const items = Array.from({ length: 30 }, (_, i) => `Result ${i + 1}`)

const open = ref(false)
const navHidden = ref(false)

onMounted(() => {
  let lastY = window.scrollY
  const onScroll = () => {
    navHidden.value = window.scrollY > lastY
    lastY = window.scrollY
  }
  window.addEventListener("scroll", onScroll)
  onBeforeUnmount(() => window.removeEventListener("scroll", onScroll))
})

watchEffect((onCleanup) => {
  if (!open.value) return
  onCleanup(preventBodyScroll())
})
</script>

<template>
  <main>
    <div class="scroll-position">
      <nav class="nav" :data-hidden="navHidden || undefined">
        Store
        <button @click="open = true">Open filters</button>
      </nav>
      <p class="hint">Scroll down, then up until the nav shows. Open and close the filters: the nav should stay put.</p>

      <template v-if="open">
        <div class="backdrop" />
        <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
          <span class="panel-title">Filters</span>
          <div class="list">
            <p v-for="item in items" :key="item">{{ item }}</p>
          </div>
          <button @click="open = false">Show results</button>
        </div>
      </template>
    </div>
  </main>
</template>
