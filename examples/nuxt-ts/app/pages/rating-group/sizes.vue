<script setup lang="ts">
import "@styles/rating-group.css"

const sizes = [
  { label: "Small", size: "16px" },
  { label: "Medium", size: "24px" },
  { label: "Large", size: "32px" },
]
</script>

<template>
  <main class="rating">
    <div class="vstack gap-5">
      <RatingGroupSized v-for="item in sizes" :key="item.label" v-bind="item" />
    </div>
  </main>
</template>
