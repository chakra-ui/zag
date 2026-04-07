<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import { computed } from "vue"
import StateVisualizer from "~/components/StateVisualizer.vue"
import Toolbar from "~/components/Toolbar.vue"

interface Character {
  name: string
  height: string
  mass: string
  hair_color: string
  skin_color: string
  eye_color: string
  birth_year: string
  gender: string
  homeworld: string
  films: string[]
  species: string[]
  vehicles: string[]
  starships: string[]
  created: string
  edited: string
  url: string
}

const service = useMachine(
  asyncList.machine as asyncList.Machine<Character, string, asyncList.SortDescriptor<Character>, string>,
  {
    autoReload: true,
    initialFilter: "",
    async load({ signal, cursor, filter }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")

      await new Promise((resolve) => setTimeout(resolve, 1000))
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filter}`, { signal })
      let json = await res.json()

      return {
        items: json.results,
        cursor: json.next,
      }
    },
    sort({ items, sorting }) {
      return {
        items:
          items.length > 0
            ? items.slice().sort((a, b) => {
                if (sorting.column != null) {
                  let cmp =
                    a[sorting.column as keyof Character] < b[sorting.column as keyof Character] ? -1 : 1
                  if (sorting.direction === "descending") {
                    cmp *= -1
                  }
                  return cmp
                } else {
                  return 1
                }
              })
            : [],
      }
    },
  },
)

const api = computed(() => asyncList.connect(service))
</script>

<template>
  <main class="async-list">
    <span>{{ api.items.length }}</span>
    <input type="text" @input="(e) => api.setFilter((e.target as HTMLInputElement).value)" />
    <div>
      <p v-if="api.isLoading">Loading...</p>
      <button @click="api.reload()">Reload</button>
      <button @click="api.loadMore()">Load More</button>
      <button @click="api.setSorting({ column: 'name', direction: 'ascending' })">Sort by name</button>
      <pre>{{ JSON.stringify(api.items, null, 2) }}</pre>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['cursor', 'filter']" :omit="['items']" />
  </Toolbar>
</template>
