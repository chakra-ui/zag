<script setup lang="ts">
import "@styles/progress.css"
</script>

<template>
  <main class="progress">
    <div class="vstack gap-8">
      <ProgressIndeterminateItem variant="linear" />
      <ProgressIndeterminateItem variant="circular" />
    </div>
  </main>
</template>
