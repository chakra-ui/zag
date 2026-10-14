<script setup lang="ts">
import "@styles/tooltip.css"
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>Tooltip Controlled (Multiple)</h1>
    <div style="display: flex; flex-direction: column; gap: 4px">
      <TooltipControlledItem v-for="index in 10" :key="index" />
    </div>
  </div>
</template>
