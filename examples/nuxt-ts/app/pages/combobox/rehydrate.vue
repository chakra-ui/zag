<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  name: string
  height: string
  mass: string
  created: string
  edited: string
  url: string
}

const listService = useMachine(asyncList.machine as asyncList.Machine<Item>, {
  autoReload: true,
  async load({ signal, filter }) {
    const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter}`, { signal })
    const data = await response.json()
    return {
      items: data.results,
      cursor: data.next,
    }
  },
})

const list = computed(() => asyncList.connect(listService))

const collection = computed(() =>
  combobox.collection({
    items: list.value.items,
    itemToValue: (item) => item.name,
    itemToString: (item) => item.name,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    defaultValue: ["C-3PO"],
    placeholder: "Example: Dexter",
    onInputValueChange({ inputValue }) {
      list.value.setFilter(inputValue)
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

let hydrated = false
watchEffect(() => {
  if (api.value.value.length && api.value.collection.size && !hydrated) {
    api.value.syncSelectedItems()
    hydrated = true
  }
})
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select country</label>
      <div v-bind="api.getControlProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
        <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div data-testid="combobox-content" v-bind="api.getContentProps()">
        <div v-if="api.collection.items.length > 0" v-bind="api.getListProps()">
          <div
            v-for="item in api.collection.items"
            :key="item.name"
            :data-testid="item.name"
            v-bind="api.getItemProps({ item })"
          >
            <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
