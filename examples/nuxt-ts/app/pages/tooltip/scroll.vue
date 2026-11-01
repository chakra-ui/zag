<script setup lang="ts">
import "@styles/tooltip.css"
</script>

<template>
  <main>
    <div class="root">
      <h2>Tooltip Scroll Hover Test</h2>
      <p>Hover over items, then scroll to see tooltips appear when cursor lands on items</p>
      <div style="height: 400px; overflow: auto; border: 1px solid #ccc; padding: 10px; margin-top: 20px">
        <div v-for="idx in 100" :key="idx" style="padding: 10px; border-bottom: 1px solid #eee">
          <TooltipScrollItem :close-on-pointer-down="true">item {{ idx - 1 }}</TooltipScrollItem>
        </div>
      </div>
    </div>
  </main>
</template>
