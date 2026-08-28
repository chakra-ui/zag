<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 15
const TOTAL = 75

const loadOlder = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    const end = TOTAL - (page - 1) * PAGE_SIZE
    setTimeout(() => {
      resolve(Array.from({ length: PAGE_SIZE }, (_, i) => `Message ${end - i}`))
    }, 600)
  })

// `async-list` appends each page, so pages arrive newest-first. Rendering the list
// reversed puts the oldest message at the top, which is what a thread looks like.
const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
  autoReload: true,
  async load({ cursor }) {
    const page = cursor ? Number(cursor) : 1
    const items = await loadOlder(page)
    return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
  },
})
const list = computed(() => asyncList.connect(listService))

const id = useId()

const service = useMachine(
  infiniteScroll.machine,
  computed(() => ({
    id,
    edge: "start" as const,
    count: list.value.items.length,
    hasMore: list.value.hasMore,
    loading: list.value.isLoading,
    onLoadMore: () => list.value.loadMore(),
  })),
)

const api = computed(() => infiniteScroll.connect(service, normalizeProps))
const messages = computed(() => [...list.value.items].reverse())
</script>

<template>
  <main class="infinite-scroll">
    <h1>Infinite Scroll — Chat (reversed)</h1>
    <p>Scroll up to load older messages ({{ list.items.length }} loaded)</p>
    <div class="scroller" tabindex="0">
      <div v-bind="api.getSentinelProps()" />
      <div v-bind="api.getIndicatorProps({ type: 'loading' })">Loading older messages…</div>
      <div v-bind="api.getIndicatorProps({ type: 'complete' })">Beginning of conversation</div>
      <ul>
        <li v-for="message in messages" :key="message">
          {{ message }}
        </li>
      </ul>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
