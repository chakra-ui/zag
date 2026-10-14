<script setup lang="ts">
import "@styles/popover.css"
</script>

<template>
  <main class="popover">
    <PopoverNestedItem id="p1">
      <PopoverNestedItem id="p2" nested>
        <PopoverNestedItem id="p3" nested />
      </PopoverNestedItem>
    </PopoverNestedItem>
  </main>
</template>
