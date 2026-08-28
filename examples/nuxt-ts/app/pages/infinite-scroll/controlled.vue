<script setup lang="ts">
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 15
const TOTAL = 60

const items = ref<string[]>([])
const loading = ref(false)

// `loading` is fully owned by the consumer here — no promise is returned from onLoadMore.
const id = useId()

const service = useMachine(
  infiniteScroll.machine,
  computed(() => ({
    id,
    count: items.value.length,
    hasMore: items.value.length < TOTAL,
    loading: loading.value,
    onLoadMore() {
      loading.value = true
      setTimeout(() => {
        items.value = [
          ...items.value,
          ...Array.from({ length: PAGE_SIZE }, (_, i) => `Row ${items.value.length + i + 1}`),
        ]
        loading.value = false
      }, 600)
    },
  })),
)

const api = computed(() => infiniteScroll.connect(service, normalizeProps))
</script>

<template>
  <main class="infinite-scroll">
    <h1>Infinite Scroll — Controlled loading</h1>
    <p>{{ loading ? "Loading…" : `Loaded ${items.length} / ${TOTAL}` }}</p>
    <div class="scroller" tabindex="0">
      <ul>
        <li v-for="item in items" :key="item">
          {{ item }}
        </li>
      </ul>
      <div v-bind="api.getSentinelProps()" />
      <div v-bind="api.getIndicatorProps({ type: 'loading' })">Loading…</div>
      <div v-bind="api.getIndicatorProps({ type: 'complete' })">End of list</div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
