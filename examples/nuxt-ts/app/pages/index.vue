<script setup lang="ts">
import { componentRoutesData } from "@zag-js/shared"
</script>

<template>
  <div class="index-nav">
    <h2>Vue UI Machines</h2>
    <ul>
      <li v-for="component in componentRoutesData" :key="component.slug">
        <NuxtLink :to="`/${component.slug}`">{{ component.label }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
