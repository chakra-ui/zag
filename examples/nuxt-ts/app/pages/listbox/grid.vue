<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { Check } from "lucide-vue-next"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

const collection = listbox.gridCollection({
  items: listboxData.photos,
  columnCount: 3,
})

const controls = useControls(listboxControls)

const service = useMachine(
  listbox.machine,
  controls.mergeProps<listbox.Props<ListboxOption>>({
    collection,
    id: useId(),
    defaultValue: ["photo-43"],
  }),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox listbox-photos">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Cover photo</label>
      <div v-bind="api.getContentProps()">
        <ul v-bind="api.getListProps()">
          <li
            v-for="item in collection.items"
            :key="item.value"
            v-bind="api.getItemProps({ item, highlightOnHover: true })"
          >
            <img :src="item.src" alt="" loading="lazy" />
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })"><Check :stroke-width="3" /></span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
