<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import { LoaderCircleIcon } from "lucide-vue-next"
import "@styles/async-list.css"

interface Character {
  id: number
  name: string
  status: string
  species: string
  image: string
  location: { name: string }
}

const status = ref("")
const gender = ref("")

const service = useMachine(
  asyncList.machine as asyncList.Machine<Character>,
  computed(() => ({
    autoReload: true,
    initialFilter: "",
    // Keep the current rows while the next filter combination loads
    keepPreviousItems: true,
    // Changing either select reloads the list
    dependencies: [status.value, gender.value],
    async load({ signal, filter }) {
      const params = new URLSearchParams()
      if (filter.trim()) params.set("name", filter.trim())
      if (status.value) params.set("status", status.value)
      if (gender.value) params.set("gender", gender.value)
      const response = await fetch(`https://rickandmortyapi.com/api/character/?${params}`, { signal })
      // The API answers 404 when nothing matches
      if (response.status === 404) return { items: [] }
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results }
    },
  })),
)
const list = computed(() => asyncList.connect(service))
</script>

<template>
  <main>
    <div class="async-list">
      <div class="async-list-toolbar">
        <input
          type="search"
          aria-label="Search characters"
          placeholder="Search characters…"
          @input="list.setFilter(($event.currentTarget as HTMLInputElement).value)"
        />
        <select v-model="status" aria-label="Status">
          <option value="">Any status</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
        <select v-model="gender" aria-label="Gender">
          <option value="">Any gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="genderless">Genderless</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div v-if="list.error" role="alert" class="async-list-status" data-type="error">
        Couldn’t load characters.
        <button @click="list.reload()">Retry</button>
      </div>
      <div v-else-if="list.isEmpty && list.isLoading" role="status" class="async-list-status">
        <LoaderCircleIcon class="async-list-spinner" /> Loading characters…
      </div>
      <div v-else-if="list.isEmpty" class="async-list-status">No characters match these filters</div>
      <ul v-else class="async-list-items" :aria-busy="list.isLoading">
        <li v-for="character in list.items" :key="character.id">
          <span class="async-list-person">
            <img class="async-list-avatar" :src="character.image" alt="" />
            <span>
              {{ character.name }}
              <span class="async-list-meta">{{ character.location.name }}</span>
            </span>
          </span>
          <span class="async-list-meta">{{ character.species }} · {{ character.status }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>
