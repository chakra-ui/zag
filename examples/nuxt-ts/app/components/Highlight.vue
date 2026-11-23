<script setup lang="ts">
import { getFuzzyMatchRanges, highlightRanges, highlightWord } from "@zag-js/utils/search"

const props = defineProps<{ text: string; query: string; fuzzy?: boolean }>()

const chunks = computed(() =>
  props.fuzzy
    ? highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) })
    : highlightWord({ text: props.text, query: props.query, ignoreCase: true, matchAll: true }),
)
</script>

<template>
  <span>
    <template v-for="(chunk, index) in chunks" :key="index">
      <mark v-if="chunk.match">{{ chunk.text }}</mark>
      <template v-else>{{ chunk.text }}</template>
    </template>
  </span>
</template>
