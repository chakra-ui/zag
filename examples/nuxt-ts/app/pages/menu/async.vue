<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

interface Character {
  name: string
}

const hasOpened = ref(false)

const listService = useMachine(asyncList.machine as asyncList.Machine<Character>, {
  autoReload: false,
  async load({ signal, cursor }) {
    if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
    await new Promise((resolve) => setTimeout(resolve, 400))
    const res = await fetch(cursor || "https://swapi.py4e.com/api/people/", { signal })
    const json = await res.json()
    return { items: json.results, cursor: json.next ?? undefined }
  },
})
const listApi = computed(() => asyncList.connect(listService))

const service = useMachine(menu.machine, {
  id: useId(),
  onSelect: console.log,
  onOpenChange({ open }) {
    if (open && !hasOpened.value) {
      hasOpened.value = true
      listApi.value.reload()
    }
  },
})
const api = computed(() => menu.connect(service, normalizeProps))

const isInitialLoading = computed(() => listApi.value.isLoading && listApi.value.items.length === 0)

const contentProps = computed(() =>
  mergeProps(api.value.getContentProps(), {
    "aria-label": "Characters",
    style: { maxHeight: "240px", overflowY: "auto", width: "220px" },
  }),
)
</script>

<template>
  <main style="padding: 40px">
    <p style="margin-bottom: 16px; color: #666">
      Opens empty, loads SWAPI people on first open, then fetches the next page when you scroll to the bottom.
    </p>
    <div>
      <button v-bind="api.getTriggerProps()">Characters <span v-bind="api.getIndicatorProps()">▾</span></button>
      <Teleport to="#teleports">
        <div v-if="api.open" v-bind="api.getPositionerProps()">
          <ul v-bind="contentProps">
            <li v-if="isInitialLoading" style="padding: 8px 6px; font-size: 13px">
              <output aria-live="polite">Loading…</output>
            </li>
            <li v-if="listApi.error" style="padding: 8px 6px; font-size: 13px">
              <output>Couldn't load characters</output>
            </li>
            <li v-if="!isInitialLoading && listApi.isEmpty && !listApi.error" style="padding: 8px 6px; font-size: 13px">
              <output>No characters found</output>
            </li>
            <li
              v-for="item in listApi.items"
              :key="item.name"
              v-bind="api.getItemProps({ value: item.name, valueText: item.name })"
            >
              {{ item.name }}
            </li>
            <LoadMore
              v-if="!isInitialLoading"
              as="li"
              :count="listApi.items.length"
              :has-more="listApi.hasMore"
              :loading="listApi.isLoading"
              :load-more="() => listApi.loadMore()"
            />
          </ul>
        </div>
      </Teleport>
    </div>
  </main>
</template>
