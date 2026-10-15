<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import { LoaderCircleIcon, RotateCwIcon } from "lucide-vue-next"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
  autoReload: true,
  // Reloading dims the current rows instead of blanking them
  keepPreviousItems: true,
  async load({ signal }) {
    const response = await fetch("https://swapi.py4e.com/api/people/", { signal })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    return { items: data.results }
  },
})

const list = computed(() => asyncList.connect(service))
</script>

<template>
  <main>
    <div class="async-list">
      <div class="async-list-toolbar">
        <button :disabled="list.isLoading" @click="list.reload()"><RotateCwIcon /> Reload</button>
        <span class="async-list-meta">{{ list.items.length }} people</span>
      </div>

      <div v-if="list.error" role="alert" class="async-list-status" data-type="error">
        Couldn’t load people.
        <button @click="list.reload()">Retry</button>
      </div>
      <div v-else-if="list.isEmpty && list.isLoading" role="status" class="async-list-status">
        <LoaderCircleIcon class="async-list-spinner" /> Loading people…
      </div>
      <ul v-else class="async-list-items" :aria-busy="list.isLoading">
        <li v-for="person in list.items" :key="person.url">
          {{ person.name }}
          <span class="async-list-meta">{{ person.birth_year }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>
