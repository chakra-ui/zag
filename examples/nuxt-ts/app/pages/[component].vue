<script setup lang="ts">
import { getComponentExamples } from "@zag-js/shared"

// A bare component path opens its first example
const route = useRoute()
await navigateTo(getComponentExamples(String(route.params.component ?? ""))[0]?.path ?? "/", { replace: true })
</script>

<template>
  <div />
</template>
