<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase())

const query = ref("")
const options = computed(() => comboboxData.filter((item) => matches(item.label, query.value)))

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()

const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    onInputValueChange({ inputValue, reason }: combobox.InputValueChangeDetails) {
      // A selected label or cleared input isn't a query
      query.value = reason === "input-change" ? inputValue : ""
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select country</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getEmptyProps()">{{ options.length === 0 ? "No results found" : "" }}</div>
        <div v-if="options.length > 0" v-bind="api.getListProps()">
          <div v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">
              <Highlight :text="item.label" :query="query" />
            </span>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
