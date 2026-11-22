<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const query = ref("")

const collection = computed(() =>
  combobox.collection({
    items: comboboxData.filter((item) => contains(item.label, query.value)),
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
    multiple: true,
    defaultValue: ["US", "CA"],
    onInputValueChange({ inputValue }) {
      query.value = inputValue
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Countries</label>
      <div v-bind="api.getControlProps()">
        <div v-bind="api.getChipGroupProps()">
          <span v-for="item in api.selectedItems" :key="item.code" v-bind="api.getChipProps({ item })">
            {{ item.label }}
            <button v-bind="api.getChipDeleteTriggerProps({ item })">
              <XIcon />
            </button>
          </span>
          <input v-bind="api.getInputProps()" :placeholder="api.value.length ? '' : 'Add countries'" />
        </div>
      </div>
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="item in collection.items" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'inputValue', 'highlightedValue']" />
  </Toolbar>
</template>
