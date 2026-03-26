<script setup lang="ts">
import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"

const route = useRoute()

const currentComponent = computed(() => {
  const pathname = route.path.split("?")[0] || "/"
  const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  return getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")
})

const items = computed(() =>
  componentRoutesData.map((component) => ({
    label: component.label,
    path: `/${component.slug}`,
    active: currentComponent.value === component.slug,
  })),
)
</script>

<template>
  <NuxtLink v-for="route in items" :data-active="dataAttr(route.active)" :to="route.path" :key="route.label">
    {{ route.label }}
  </NuxtLink>
</template>
