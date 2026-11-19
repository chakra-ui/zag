<script setup lang="ts">
import { trackFocusVisible } from "@zag-js/focus-visible"
import { onMounted, onUnmounted, ref } from "vue"
import "@styles/focus-visible.css"

const projects = [
  { name: "Design system", meta: "42 components" },
  { name: "Mobile app", meta: "Updated 2 hours ago" },
  { name: "Marketing site", meta: "3 open reviews" },
  { name: "Billing service", meta: "Deployed yesterday" },
]

const focusVisible = ref(false)
const focusWithin = ref(false)
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = trackFocusVisible({ onChange: (details) => (focusVisible.value = details.isFocusVisible) })
})

onUnmounted(() => {
  if (cleanup) cleanup()
})

function onFocusout(event: FocusEvent) {
  const grid = event.currentTarget as HTMLElement
  if (grid.contains(event.relatedTarget as Node | null)) return
  focusWithin.value = false
}
</script>

<template>
  <main>
    <div class="focus-visible-card-grid">
      <p class="hint">Tab through the projects to outline the grid. Clicking a project doesn't.</p>
      <div
        class="grid"
        data-testid="card-grid"
        :data-focus-visible="focusVisible && focusWithin ? '' : undefined"
        @focusin="focusWithin = true"
        @focusout="onFocusout"
      >
        <button v-for="project in projects" :key="project.name" type="button" class="card">
          <strong>{{ project.name }}</strong>
          <span class="meta">{{ project.meta }}</span>
        </button>
      </div>
    </div>
  </main>
</template>
