<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.calendarViews })

const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
  collection,
  id: useId(),
  defaultValue: ["week"],
  orientation: "horizontal",
  selectionMode: "single",
  deselectable: false,
  // arrow keys select as they move
  selectOnHighlight: true,
})

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox listbox-segmented">
    <div class="listbox-stack">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Calendar view</label>
        <div v-bind="api.getContentProps()">
          <ul v-bind="api.getListProps()">
            <li v-for="item in listboxData.calendarViews" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="listbox-preview" data-testid="preview">Showing the {{ api.valueAsString.toLowerCase() }} view</div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
  </Toolbar>
</template>
