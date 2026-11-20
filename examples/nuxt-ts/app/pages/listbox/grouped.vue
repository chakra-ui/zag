<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { groupedData, listboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

type Item = (typeof groupedData)[number]

const collection = listbox.collection({ items: groupedData, groupBy: (item) => item.type })

const controls = useControls(listboxControls)

const service = useMachine(
  listbox.machine as listbox.Machine<Item>,
  controls.mergeProps<listbox.Props<Item>>({
    collection,
    id: useId(),
  }),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="[type, items] in collection.group()" :key="type" v-bind="api.getItemGroupProps({ id: type })">
            <div v-bind="api.getItemGroupLabelProps({ htmlFor: type })">{{ type }}</div>
            <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['highlightedValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
