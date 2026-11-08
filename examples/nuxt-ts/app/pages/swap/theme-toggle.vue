<script setup lang="ts">
import "@styles/swap.css"

const dark = ref(false)
</script>

<template>
  <main>
    <div class="swap-theme-toggle">
      <button
        type="button"
        class="swap-trigger"
        :aria-label="dark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="dark = !dark"
      >
        <Swap :open="dark">
          <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-moon">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          <template #fallback>
            <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-sun">
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              />
            </svg>
          </template>
        </Swap>
      </button>
      <p class="swap-hint">Click the button to flip between sun and moon.</p>
    </div>
  </main>
</template>
