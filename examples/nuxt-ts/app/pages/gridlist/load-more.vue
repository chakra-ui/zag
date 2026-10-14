<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon } from "lucide-vue-next"
import "@styles/gridlist.css"

interface Pokemon {
  name: string
  url: string
}

const listService = useMachine(asyncList.machine as asyncList.Machine<Pokemon>, {
  autoReload: true,
  async load({ signal, cursor }) {
    const url = cursor ?? "https://pokeapi.co/api/v2/pokemon?limit=20"
    const res = await fetch(url, { signal })
    const json = await res.json()
    return { items: json.results, cursor: json.next ?? undefined }
  },
})
const listApi = computed(() => asyncList.connect(listService))

const scrollApi = useInfiniteScroll(() => ({
  count: listApi.value.items.length,
  hasMore: listApi.value.hasMore,
  loading: listApi.value.isLoading,
  onLoadMore: () => listApi.value.loadMore(),
}))

const collection = computed(() =>
  gridlist.collection<Pokemon>({
    items: listApi.value.items,
    itemToValue: (item) => item.name,
    itemToString: (item) => item.name,
  }),
)

const id = useId()
const service = useMachine(
  gridlist.machine as gridlist.Machine<Pokemon>,
  computed(() => ({
    id,
    collection: collection.value,
    selectionMode: "single" as const,
  })),
)

const api = computed(() => gridlist.connect(service, normalizeProps))

const isInitialLoading = computed(() => listApi.value.isLoading && listApi.value.items.length === 0)
const isLoadingMore = computed(() => listApi.value.isLoading && listApi.value.items.length > 0)
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Pokemon ({{ listApi.items.length }} loaded)</label>
        <div v-bind="api.getContentProps()">
          <div v-if="isInitialLoading" role="status" aria-live="polite" style="padding: 12px 14px; color: #71717a">
            Loading…
          </div>

          <div v-for="item in listApi.items" :key="item.name" v-bind="api.getItemProps({ item, focusOnHover: true })">
            <div v-bind="api.getCellProps()">
              <button v-if="api.hasCheckbox" v-bind="api.getItemCheckboxProps({ item })">
                <CheckIcon v-bind="api.getItemIndicatorProps({ item })" />
              </button>
              <div class="gridlist-item-body">
                <span v-bind="api.getItemTextProps({ item })" class="gridlist-item-title">{{ item.name }}</span>
                <span class="gridlist-item-description">{{ item.url }}</span>
              </div>
            </div>
          </div>

          <div v-bind="scrollApi.getSentinelProps()" />

          <div v-if="isLoadingMore" role="status" aria-live="polite" style="padding: 12px 14px; color: #71717a">
            Loading more…
          </div>

          <div
            v-if="!listApi.hasMore && !listApi.isLoading && listApi.items.length > 0"
            role="status"
            aria-live="polite"
            style="padding: 12px 14px; color: #a1a1aa"
          >
            End of list
          </div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Selected: <strong>{{ api.valueAsString || "none" }}</strong>
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue', 'value']" />
  </Toolbar>
</template>
