<script setup lang="ts">
// A remount resets this to 0, so a steady count proves the dialog was never torn down.
const ticks = ref(0)
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  interval = setInterval(() => ticks.value++, 100)
})

onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <p data-testid="uptime">
    content uptime: <b data-testid="ticks">{{ ticks }}</b> ticks
  </p>
</template>
