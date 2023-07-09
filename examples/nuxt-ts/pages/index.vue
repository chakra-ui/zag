<script setup lang="ts">
import { routesData } from "@zag-js/shared"
</script>

<template>
  <div class="index-nav">
    <h2>Vue UI Machines</h2>
    <ul>
      <li v-for="route in routesData">
        <NuxtLink :to="route.path">{{ route.label }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
