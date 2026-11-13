<script setup lang="ts">
import { jsonTreeCircularData } from "@zag-js/shared"
</script>

<template>
  <main>
    <JsonTree
      :data="jsonTreeCircularData"
      label="Workspace with circular references"
      hint="Circular references show a marker instead of expanding forever."
    />
  </main>
</template>
