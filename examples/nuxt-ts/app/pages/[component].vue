<script setup lang="ts">
import { componentRoutesData, getComponentExamples, isKnownComponent } from "@zag-js/shared"

const route = useRoute()
const query = ref("")

const currentComponent = computed(() => String(route.params.component ?? ""))
const componentInfo = computed(() => componentRoutesData.find((item) => item.slug === currentComponent.value))
const examples = computed(() => getComponentExamples(currentComponent.value))

watch(currentComponent, () => {
  query.value = ""
})

const filteredExamples = computed(() => {
  const search = query.value.trim().toLowerCase()
  if (!search) return examples.value
  return examples.value.filter((example) => example.title.toLowerCase().includes(search))
})
</script>

<template>
  <div v-if="isKnownComponent(currentComponent) && componentInfo" class="index-nav component-index-nav">
    <h2>{{ componentInfo.label }} Examples ({{ filteredExamples.length }}/{{ examples.length }})</h2>

    <div class="component-search">
      <input
        v-model="query"
        :aria-label="`Search ${componentInfo.label} examples`"
        placeholder="Search examples"
        type="search"
      />
    </div>

    <ul v-if="filteredExamples.length > 0">
      <li v-for="example in filteredExamples" :key="example.path">
        <NuxtLink :to="example.path">{{ example.title }}</NuxtLink>
      </li>
    </ul>

    <p v-else class="empty-state">No examples found.</p>
  </div>

  <div v-else class="index-nav component-index-nav">Unknown component.</div>
</template>
