<script setup lang="ts">
import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { ref, onMounted, computed } from "vue"

const referenceRef = ref<HTMLButtonElement | null>(null)
const floatingRef = ref<HTMLDivElement | null>(null)
const positioned = ref({})

onMounted(() => {
  if (!referenceRef.value || !floatingRef.value) return
  return getPlacement(referenceRef.value, floatingRef.value, {
    placement: "right-start",
    onComplete(data) {
      positioned.value = data
    },
  })
})

const styles = computed(() => getPlacementStyles(positioned.value))
</script>

<template>
  <main>
    <button ref="referenceRef">Hello StackBlitz!</button>
    <div :style="styles.floating" ref="floatingRef">Start editing to see some magic happen :)</div>
  </main>
</template>
