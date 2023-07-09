<script setup lang="ts">
import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"

const router = useRouter()

const items = computed(() =>
  routesData
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((route) => ({
      label: route.label,
      path: route.path,
      active: route.path === router.currentRoute.value.path,
    })),
)
</script>

<template>
  <NuxtLink v-for="route in items" :data-active="dataAttr(route.active)" :to="route.path" :key="route.label">
    {{ route.label }}
  </NuxtLink>
</template>
