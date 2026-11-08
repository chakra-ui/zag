<script setup lang="ts">
import "@styles/swap.css"

const open = ref(false)
</script>

<template>
  <main>
    <div class="swap-menu-toggle">
      <button
        type="button"
        class="swap-trigger"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <Swap :open="open">
          <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-close">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <template #fallback>
            <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-menu">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </template>
        </Swap>
      </button>
      <p class="swap-hint">Click the button to swap the menu icon.</p>
    </div>
  </main>
</template>
