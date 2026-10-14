<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
]

const value = ref<string[]>(["react"])
const options = ref(frameworks)

const collection = computed(() =>
  listbox.collection({
    items: options.value,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  listbox.machine as listbox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    value: value.value,
    onValueChange: (e: listbox.ValueChangeDetails<Item>) => {
      value.value = e.value
    },
  })),
)

const api = computed(() => listbox.connect(service, normalizeProps))

const setSolid = () => {
  options.value = frameworks
  value.value = ["solid"]
}
</script>

<template>
  <main class="listbox" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
      <div data-testid="selected-items" style="font-size: 0.875rem">
        <strong>Selected items (from api):</strong> {{ api.selectedItems.map((item) => item.label).join(", ") }}
      </div>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select framework</label>
        <div data-testid="listbox-content" v-bind="api.getContentProps()">
          <ul v-bind="api.getListProps()">
            <li v-for="item in options" :key="item.value" :data-testid="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </li>
          </ul>
        </div>
      </div>

      <button data-testid="filter-vue-button" @click="options = [frameworks[2]!]">Filter to Vue</button>
      <button data-testid="set-solid-button" @click="setSolid">Set value to Solid</button>
    </div>
  </main>
</template>
