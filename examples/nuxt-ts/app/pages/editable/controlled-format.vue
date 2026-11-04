<script setup lang="ts">
const fields = [
  { name: "no-digits", format: (value: string) => value.replace(/\d/g, "") },
  { name: "uppercase", format: (value: string) => value.toUpperCase() },
]
</script>

<template>
  <main class="editable">
    <EditableFormatField v-for="field in fields" :key="field.name" :name="field.name" :format="field.format" />
  </main>
</template>
