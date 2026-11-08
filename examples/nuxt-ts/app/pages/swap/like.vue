<script setup lang="ts">
import "@styles/swap.css"

const liked = ref(false)
</script>

<template>
  <main>
    <div class="swap-like">
      <button
        type="button"
        class="swap-trigger"
        :aria-label="`Like, ${liked ? 129 : 128}`"
        :aria-pressed="liked"
        @click="liked = !liked"
      >
        <Swap :open="liked">
          <svg class="swap-icon" data-filled="" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-liked">
            <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" />
          </svg>
          <template #fallback>
            <svg class="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-unliked">
              <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z" />
            </svg>
          </template>
        </Swap>
      </button>
      <span class="swap-count" data-testid="like-count">{{ liked ? 129 : 128 }}</span>
      <p class="swap-hint">Click the heart to like or unlike the post.</p>
    </div>
  </main>
</template>
