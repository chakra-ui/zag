<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import { ArrowRightIcon, SearchIcon } from "lucide-vue-next"

const { contains } = createFilter({ sensitivity: "base" })

const components = componentRoutesData.map((item) => {
  const examples = getComponentExamples(item.slug)
  return { ...item, href: examples[0]?.path ?? `/${item.slug}`, count: examples.length }
})

const query = ref("")
const filtered = computed(() => components.filter((item) => contains(item.label, query.value)))
</script>

<template>
  <div class="pg-home">
    <div class="pg-home-inner">
      <div class="pg-hero">
        <span class="pg-eyebrow"><i aria-hidden="true" />Vue playground</span>
        <h1>Zag components</h1>
        <p>
          Every state machine with live examples, controls and a state inspector. Press
          <kbd class="pg-kbd">⌘K</kbd> to jump anywhere.
        </p>
      </div>

      <label class="pg-filter">
        <SearchIcon aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          aria-label="Filter components"
          :placeholder="`Filter ${components.length} components…`"
        />
      </label>

      <p v-if="filtered.length === 0" class="pg-home-empty" role="status">No components match “{{ query }}”</p>
      <ul v-else class="pg-grid">
        <li v-for="item in filtered" :key="item.slug">
          <NuxtLink :to="item.href" class="pg-card">
            <strong>
              {{ item.label }}
              <ArrowRightIcon aria-hidden="true" />
            </strong>
            <span>{{ item.count }} {{ item.count === 1 ? "example" : "examples" }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
