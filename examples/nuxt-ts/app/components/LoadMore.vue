<script setup lang="ts">
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = withDefaults(
  defineProps<{
    count: number
    hasMore: boolean
    loading: boolean
    loadMore: () => void
    /**
     * Wrapper for the sentinel + indicator. Use `"li"` inside a menu `<ul>`; `"div"` elsewhere.
     */
    as?: "div" | "li"
  }>(),
  { as: "div" },
)

const id = useId()
const service = useMachine(
  infiniteScroll.machine,
  computed(() => ({
    id,
    count: props.count,
    hasMore: props.hasMore,
    loading: props.loading,
    onLoadMore: () => props.loadMore(),
  })),
)
const api = computed(() => infiniteScroll.connect(service, normalizeProps))
</script>

<template>
  <component :is="as" :role="as === 'li' ? 'presentation' : undefined">
    <div v-bind="api.getSentinelProps()" />
    <div v-bind="api.getIndicatorProps({ type: 'loading' })" style="padding: 8px 12px; font-size: 13px">
      <slot>Loading more…</slot>
    </div>
  </component>
</template>
