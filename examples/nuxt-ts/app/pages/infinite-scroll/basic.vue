<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 20
const TOTAL = 100

const loadPage = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    const start = (page - 1) * PAGE_SIZE
    setTimeout(() => {
      resolve(Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => `Item ${start + i + 1}`))
    }, 500)
  })

const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
  autoReload: true,
  async load({ cursor }) {
    const page = cursor ? Number(cursor) : 1
    const items = await loadPage(page)
    return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
  },
})
const list = computed(() => asyncList.connect(listService))

const id = useId()

const service = useMachine(
  infiniteScroll.machine,
  computed(() => ({
    id,
    count: list.value.items.length,
    hasMore: list.value.hasMore,
    loading: list.value.isLoading,
    onLoadMore: () => list.value.loadMore(),
  })),
)

const api = computed(() => infiniteScroll.connect(service, normalizeProps))
</script>

<template>
  <main class="infinite-scroll">
    <h1>Infinite Scroll — Basic</h1>
    <p>Loaded {{ list.items.length }} / {{ TOTAL }}</p>
    <div class="scroller" tabindex="0">
      <ul>
        <li v-for="item in list.items" :key="item">
          {{ item }}
        </li>
      </ul>
      <div v-bind="api.getSentinelProps()" />
      <div v-bind="api.getIndicatorProps({ type: 'loading' })">Loading…</div>
      <div v-bind="api.getIndicatorProps({ type: 'complete' })">You're all caught up</div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
