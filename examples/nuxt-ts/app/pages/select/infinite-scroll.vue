<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon, XIcon } from "lucide-vue-next"
import "@styles/select.css"

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

const collection = computed(() =>
  select.collection({
    items: listApi.value.items,
    itemToValue: (item) => item.name,
    itemToString: (item) => item.name,
  }),
)

const id = useId()
const service = useMachine(
  select.machine as select.Machine<Pokemon>,
  computed(() => ({ id, collection: collection.value })),
)
const api = computed(() => select.connect(service, normalizeProps))

const isInitialLoading = computed(() => listApi.value.isLoading && listApi.value.items.length === 0)
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Pokemon</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select a Pokemon" }}</span>
        </button>
        <div class="select-indicator-group">
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </div>
      </div>

      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-if="isInitialLoading" role="status" aria-live="polite" style="padding: 8px 12px">Loading...</div>

            <div v-bind="api.getListProps()">
              <div v-for="item in listApi.items" :key="item.name" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.name }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>

              <LoadMore
                :count="listApi.items.length"
                :has-more="listApi.hasMore"
                :loading="listApi.isLoading"
                :load-more="() => listApi.loadMore()"
              >
                Loading more...
              </LoadMore>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
