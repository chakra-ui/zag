<script setup lang="ts">
import { jsonTreeLargeData } from "@zag-js/shared"

const options = { groupArraysAfterLength: 100, collapseStringsAfterLength: 40, maxPreviewItems: 4 }
</script>

<template>
  <main>
    <JsonTree
      :data="jsonTreeLargeData"
      label="Audit log export"
      hint="The 500 events are grouped into ranges of 100. Expand a range to see its events."
      :options="options"
    />
  </main>
</template>
