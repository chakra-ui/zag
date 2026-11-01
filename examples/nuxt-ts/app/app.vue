<script lang="ts" setup>
import "@styles/global.css"
import "@styles/playground.css"
import Shell from "~/components/shell/Shell.vue"
import { prefsScript } from "~/components/shell/prefs"

useHead({
  title: "Zag Playground",
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    // Same font as the website
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400..800&display=swap" },
  ],
  // Sets saved shell prefs on <html> before first paint
  script: [{ innerHTML: prefsScript, tagPosition: "head" }],
})
</script>

<template>
  <Shell>
    <NuxtPage />
  </Shell>
</template>
