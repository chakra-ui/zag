<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import "@styles/infinite-scroll.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

const listService = useMachine(asyncList.machine as asyncList.Machine<Person>, {
  autoReload: true,
  // Keep showing the last results while the next query loads
  keepPreviousItems: true,
  async load({ signal, filter, cursor }) {
    const search = encodeURIComponent(filter?.trim() ?? "")
    const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    return { items: data.results ?? [], cursor: data.next ?? undefined }
  },
})

const list = computed(() => asyncList.connect(listService))

const scroll = useInfiniteScroll(() => ({
  count: list.value.items.length,
  hasMore: list.value.hasMore,
  loading: list.value.isLoading,
  onLoadMore: () => list.value.loadMore(),
}))

const searching = computed(() => list.value.isLoading && !list.value.isLoadingMore)
</script>

<template>
  <main class="infinite-scroll">
    <input
      type="search"
      aria-label="Search people"
      placeholder="Search people…"
      @input="list.setFilter(($event.currentTarget as HTMLInputElement).value)"
    />
    <p data-testid="summary">{{ list.items.length }} loaded{{ searching ? " · Searching…" : "" }}</p>

    <div class="scroller" tabindex="0" :aria-busy="list.isLoading || undefined">
      <ul>
        <li v-for="item in list.items" :key="item.url">
          {{ item.name }} <small>{{ item.birth_year }}</small>
        </li>
      </ul>
      <div v-if="!list.isLoading && list.isEmpty" class="footer">No people found</div>
      <div v-bind="scroll.getSentinelProps()" />
      <div v-if="list.isLoadingMore" v-bind="scroll.getIndicatorProps({ type: 'loading' })">Loading more…</div>
      <div v-if="!list.isLoading && !list.isEmpty" v-bind="scroll.getIndicatorProps({ type: 'complete' })">
        You’ve reached the end
      </div>
    </div>
  </main>
</template>
