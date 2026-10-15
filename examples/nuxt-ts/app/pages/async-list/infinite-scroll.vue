<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import { LoaderCircleIcon } from "lucide-vue-next"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
  autoReload: true,
  initialFilter: "",
  // Keep showing the last results while the next query loads
  keepPreviousItems: true,
  async load({ signal, filter, cursor }) {
    const search = encodeURIComponent(filter.trim())
    const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    return { items: data.results ?? [], cursor: data.next ?? undefined }
  },
})

const list = computed(() => asyncList.connect(service))

const scroll = useInfiniteScroll(() => ({
  count: list.value.items.length,
  hasMore: list.value.hasMore,
  loading: list.value.isLoading,
  onLoadMore: () => list.value.loadMore(),
}))

const searching = computed(() => list.value.isLoading && !list.value.isLoadingMore)
</script>

<template>
  <main>
    <div class="async-list">
      <div class="async-list-toolbar">
        <input
          type="search"
          aria-label="Search people"
          placeholder="Search people…"
          @input="list.setFilter(($event.currentTarget as HTMLInputElement).value)"
        />
        <span class="async-list-meta" data-testid="summary">
          {{ searching ? "Searching…" : `${list.items.length} loaded` }}
        </span>
      </div>

      <div class="async-list-panel async-list-scroller" tabindex="0" aria-label="People">
        <div v-if="list.error" role="alert" class="async-list-status" data-type="error">
          Couldn’t load people.
          <button @click="list.reload()">Retry</button>
        </div>
        <div v-else-if="list.isEmpty && list.isLoading" role="status" class="async-list-status">
          <LoaderCircleIcon class="async-list-spinner" /> Loading people…
        </div>
        <div v-else-if="list.isEmpty" class="async-list-status">No people found</div>
        <ul v-else class="async-list-items" :aria-busy="searching">
          <li v-for="person in list.items" :key="person.url">
            {{ person.name }}
            <span class="async-list-meta">{{ person.birth_year }}</span>
          </li>
        </ul>
        <div v-bind="scroll.getSentinelProps()" />
        <div v-if="list.isLoadingMore" v-bind="scroll.getIndicatorProps({ type: 'loading' })" class="async-list-status">
          <LoaderCircleIcon class="async-list-spinner" /> Loading more…
        </div>
        <div
          v-if="!list.isLoading && !list.isEmpty"
          v-bind="scroll.getIndicatorProps({ type: 'complete' })"
          class="async-list-status"
        >
          You’ve reached the end
        </div>
      </div>
    </div>
  </main>
</template>
