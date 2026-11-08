<script setup lang="ts">
import { preventBodyScroll } from "@zag-js/remove-scroll"
import "@styles/scroll-lock.css"

const sheetOpen = ref(false)
const confirmOpen = ref(false)

watchEffect((onCleanup) => {
  if (!sheetOpen.value) return
  onCleanup(preventBodyScroll())
})

watchEffect((onCleanup) => {
  if (!confirmOpen.value) return
  onCleanup(preventBodyScroll())
})

const closeSheet = () => {
  confirmOpen.value = false
  sheetOpen.value = false
}
</script>

<template>
  <main>
    <div class="nested">
      <p class="hint">Open the settings, then the confirmation. Closing the confirmation keeps the page locked.</p>
      <button data-testid="open-sheet" @click="sheetOpen = true">Open settings</button>

      <template v-if="sheetOpen">
        <div class="backdrop" />
        <div class="panel sheet" role="dialog" aria-modal="true" aria-label="Workspace settings" data-testid="sheet">
          <span class="panel-title">Workspace settings</span>
          <p>Rename the workspace, invite teammates or remove it for good.</p>
          <div class="row">
            <button data-testid="open-confirm" @click="confirmOpen = true">Delete workspace</button>
            <button data-testid="close-sheet" @click="closeSheet">Close</button>
          </div>
        </div>
      </template>

      <template v-if="confirmOpen">
        <div class="backdrop" data-layer="confirm" />
        <div
          class="panel confirm"
          role="alertdialog"
          aria-modal="true"
          aria-label="Delete workspace?"
          data-testid="confirm"
        >
          <span class="panel-title">Delete workspace?</span>
          <p>All projects in Northwind Design will be removed.</p>
          <div class="row">
            <button data-testid="close-confirm" @click="confirmOpen = false">Keep workspace</button>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
