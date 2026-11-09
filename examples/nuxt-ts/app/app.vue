<script lang="ts" setup>
import "@styles/global.css"
import "@styles/playground.css"
import Shell from "~/components/shell/Shell.vue"
import { prefsScript } from "~/components/shell/prefs"

useHead({
  title: "Zag Playground",
  // Sets saved shell prefs on <html> before first paint
  script: [{ innerHTML: prefsScript, tagPosition: "head" }],
})
</script>

<template>
  <Shell>
    <NuxtPage />
  </Shell>
</template>
