<script setup lang="ts">
// Shows the machine props an example passes, so the demo explains itself
defineProps<{ value: Record<string, unknown> }>()
</script>

<template>
  <dl class="example-props">
    <div v-for="(item, key) in value" :key="key">
      <dt>{{ key }}</dt>
      <dd>{{ typeof item === "function" ? "ƒ" : JSON.stringify(item) }}</dd>
    </div>
  </dl>
</template>
