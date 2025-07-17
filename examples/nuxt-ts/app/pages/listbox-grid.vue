<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { listboxControls, selectData } from "@zag-js/shared"

interface Item {
  label: string
  value: string
}

const controls = useControls(listboxControls)

const collection = listbox.gridCollection({
  items: selectData,
  columnCount: 3,
})

const service = useMachine(
  listbox.machine,
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
      <ul v-bind="api.getContentProps()">
        <li v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
          <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
          <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
        </li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
