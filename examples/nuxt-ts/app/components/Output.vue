<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{ label: string; value: unknown }>()

// Short values stay on one line
const text = computed(() => {
  if (typeof props.value === "string") return props.value
  const inline = JSON.stringify(props.value)
  return inline && inline.length <= 48 ? inline : JSON.stringify(props.value, null, 2)
})
</script>

<template>
  <!-- Labeled readout of example state; extra attributes go on the pre -->
  <div class="output">
    <span class="output-label">{{ label }}</span>
    <pre v-bind="$attrs">{{ text }}</pre>
  </div>
</template>
