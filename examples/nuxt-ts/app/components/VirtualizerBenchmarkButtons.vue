<script setup lang="ts">
withDefaults(defineProps<{ counts?: number[] }>(), { counts: () => [100, 500, 1000] })
defineEmits<{ run: [scrollCount: number] }>()
</script>

<template>
  <div style="display: flex; gap: 8px; margin-bottom: 12px">
    <button
      v-for="count in counts"
      :key="count"
      style="padding: 6px 12px; border-radius: 4px; cursor: pointer"
      @click="$emit('run', count)"
    >
      {{ count }} scrolls
    </button>
  </div>
</template>
