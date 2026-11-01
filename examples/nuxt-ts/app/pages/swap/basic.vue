<script setup lang="ts">
import "@styles/swap.css"

const muted = ref(false)
</script>

<template>
  <main class="swap">
    <button @click="muted = !muted">
      <Swap :open="muted">
        <div>Muted</div>
        <template #fallback>
          <div>Unmuted</div>
        </template>
      </Swap>
    </button>
  </main>
</template>
