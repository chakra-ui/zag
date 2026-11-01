<script setup lang="ts">
defineProps<{ open: boolean }>()
</script>

<template>
  <Presence data-scope="swap" :hidden="!open">
    <slot />
  </Presence>
  <Presence data-scope="swap" :hidden="open">
    <slot name="fallback" />
  </Presence>
</template>
