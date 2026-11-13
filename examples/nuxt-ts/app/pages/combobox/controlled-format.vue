<script setup lang="ts">
const fields = [
  { label: "Digits", items: ["10001", "20002", "30003", "94105"], format: (value: string) => value.replace(/\D/g, "") },
  { label: "Uppercase", items: ["ABC", "LAX", "NYC", "SFO"], format: (value: string) => value.toUpperCase() },
]
</script>

<template>
  <main class="combobox">
    <ComboboxFormatField
      v-for="field in fields"
      :key="field.label"
      :label="field.label"
      :items="field.items"
      :format="field.format"
    />
  </main>
</template>
