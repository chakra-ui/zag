<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { listboxControls, selectData } from "@zag-js/shared"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const filter = createFilter({ sensitivity: "base" })

const search = ref("")

const collection = computed(() => {
  const items = selectData.filter((item) => filter.startsWith(item.label, search.value))
  return listbox.collection({ items })
})

const controls = useControls(listboxControls)
const controlProps = controls.mergeProps<listbox.Props<Item>>({})

const id = useId()
const service = useMachine(
  listbox.machine as listbox.Machine<Item>,
  computed(() => ({
    ...controlProps.value,
    collection: collection.value,
    id,
    typeahead: false,
  })),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Country</label>
      <div v-bind="api.getContentProps()">
        <input
          v-bind="api.getInputProps({ autoHighlight: true })"
          aria-label="Filter countries"
          placeholder="Filter…"
          :value="search"
          @input="(e) => (search = (e.currentTarget as HTMLInputElement).value)"
        />
        <div v-bind="api.getEmptyProps()">{{ collection.size === 0 ? `No matches for "${search}"` : "" }}</div>
        <ul v-bind="api.getListProps()">
          <li v-for="item in collection.items" :key="item.value" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['highlightedValue', 'focused']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
