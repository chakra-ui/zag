<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/utils/search"
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
const items = computed(() => comboboxData.filter((item) => contains(item.label, query.value)))

const collection = computed(() =>
  combobox.collection({
    items: items.value,
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
    onOpenChange({ open }) {
      if (open) query.value = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") query.value = inputValue
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
const selectAll = computed(() => api.value.getSelectAllState())
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Countries</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" :placeholder="`${api.value.length} selected`" />
        <button v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <pre data-testid="value">value: {{ api.value.join(", ") || "—" }}</pre>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <!-- Selects every item that matches the text, or unselects them all -->
          <div v-bind="api.getSelectAllProps()">
            <span class="combobox-check">{{ selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : "" }}</span>
            <span>{{ selectAll.checked ? "Unselect all" : "Select all" }}</span>
          </div>
          <hr v-bind="api.getSeparatorProps()" />
          <div v-for="item in items" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
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
