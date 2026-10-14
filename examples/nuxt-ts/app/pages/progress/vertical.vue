<script setup lang="ts">
import "@styles/progress.css"

const levels = [
  { label: "CPU", value: 72 },
  { label: "RAM", value: 45 },
  { label: "Disk", value: 90 },
]
</script>

<template>
  <main class="progress">
    <div class="hstack gap-8">
      <ProgressVerticalLevel v-for="level in levels" :key="level.label" v-bind="level" />
    </div>
  </main>
</template>
