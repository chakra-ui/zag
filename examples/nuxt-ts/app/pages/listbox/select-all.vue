<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.notifications })

const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
  collection,
  id: useId(),
  defaultValue: ["comments", "mentions"],
  selectionMode: "multiple",
})

const api = computed(() => listbox.connect(service, normalizeProps))
const allSelected = computed(() => api.value.value.length === collection.size)
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Email notifications</label>
      <div v-bind="api.getContentProps()">
        <div class="listbox-header">
          <span data-testid="value-text">{{ api.value.length }} of {{ collection.size }} selected</span>
          <div>
            <button type="button" :disabled="allSelected" @click="api.selectAll()">Select all</button>
            <button type="button" :disabled="api.value.length === 0" @click="api.clearValue()">Clear</button>
          </div>
        </div>
        <ul v-bind="api.getListProps()">
          <li
            v-for="item in listboxData.notifications"
            :key="item.value"
            v-bind="api.getItemProps({ item, highlightOnHover: true })"
          >
            <div class="listbox-item-body">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span class="listbox-item-description">{{ item.description }}</span>
            </div>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
  </Toolbar>
</template>
