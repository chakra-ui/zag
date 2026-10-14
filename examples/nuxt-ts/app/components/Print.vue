<script setup lang="ts">
defineProps<{ title: string; value: any }>()
</script>

<template>
  <div class="output">
    <p>{{ title }}</p>
    <pre data-testid="output">{{ JSON.stringify(value, null, 2) }}</pre>
  </div>
</template>
