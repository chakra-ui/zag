<script setup lang="ts">
import { isFocusRestoredByWindow, trackFocusVisible } from "@zag-js/focus-visible"
import { onMounted, onUnmounted, ref } from "vue"
import "@styles/focus-visible.css"

const recentSearches = ["Controlled state", "Positioning", "Form integration"]

const query = ref("")
const open = ref(false)
const lastFocus = ref("Not focused yet")
let cleanup: VoidFunction | undefined

onMounted(() => {
  cleanup = trackFocusVisible()
})

onUnmounted(() => {
  if (cleanup) cleanup()
})

function onFocus() {
  const restored = isFocusRestoredByWindow()
  lastFocus.value = restored ? "Restored by the window" : "Moved by you"
  if (!restored) open.value = true
}

function onFocusout(event: FocusEvent) {
  const search = event.currentTarget as HTMLElement
  if (search.contains(event.relatedTarget as Node | null)) return
  open.value = false
}
</script>

<template>
  <main>
    <div class="focus-visible-window-restore">
      <p class="hint">Switch tabs and come back</p>
      <div class="search" @focusout="onFocusout">
        <input v-model="query" type="search" aria-label="Search docs" placeholder="Search docs" @focus="onFocus" />
        <ul v-if="open" class="recent" aria-label="Recent searches">
          <li v-for="search in recentSearches" :key="search">
            <button type="button" @mousedown.prevent @click="query = search">{{ search }}</button>
          </li>
        </ul>
      </div>
      <p class="status">Last focus: <span>{{ lastFocus }}</span></p>
    </div>
  </main>
</template>
