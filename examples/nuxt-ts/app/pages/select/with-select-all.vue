<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

const collection = select.collection({ items: selectData })

const service = useMachine(select.machine as select.Machine<Item>, {
  id: useId(),
  collection,
  multiple: true,
  closeOnSelect: false,
})

const api = computed(() => select.connect(service, normalizeProps))

const allSelected = computed(() => api.value.value.length === collection.size)
const someSelected = computed(() => api.value.value.length > 0 && !allSelected.value)

const toggleAll = () => {
  if (allSelected.value) api.value.clearValue()
  else api.value.selectAll()
}
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Countries</label>
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.hasSelectedItems ? `${api.value.length} selected` : "Select countries" }}</span>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <label data-select-select-all="">
              <input type="checkbox" :checked="allSelected" :indeterminate="someSelected" @change="toggleAll" />
              <span>{{ allSelected ? "Deselect all" : "Select all" }}</span>
              <span data-select-select-all-count="">{{ api.value.length }} / {{ collection.size }}</span>
            </label>

            <div v-bind="api.getListProps()">
              <div v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
