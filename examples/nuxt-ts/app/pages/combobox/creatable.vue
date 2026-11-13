<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

const { contains } = createFilter({ sensitivity: "base" })

const items = ref(initialItems)
const query = ref("")

const search = computed(() => query.value.trim())
const filtered = computed(() => items.value.filter((item) => contains(item.label, search.value)))
// The "Create" option is the new item itself, so selecting it needs no extra mapping
const exists = computed(() => items.value.some((item) => item.label.toLowerCase() === search.value.toLowerCase()))
const newItem = computed(() => (search.value && !exists.value ? toItem(search.value) : null))
const options = computed(() => (newItem.value ? [...filtered.value, newItem.value] : filtered.value))

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  }),
)

const id = useId()

const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    allowCustomValue: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") query.value = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") query.value = inputValue
    },
    onValueChange({ items: selected }) {
      const [item] = selected as Item[]
      if (item && !items.value.some((existing) => existing.value === item.value)) {
        items.value = [...items.value, item]
      }
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" placeholder="Search or create" />
        <button v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="item in options" :key="item.value" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
            <span>{{ item.value === newItem?.value ? `Create "${item.label}"` : item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
