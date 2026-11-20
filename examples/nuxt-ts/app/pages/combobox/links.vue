<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

const links = [
  { label: "Basic", href: "/combobox/basic" },
  { label: "Async", href: "/combobox/async" },
  { label: "Multiple", href: "/combobox/multiple" },
]

const items = ref(links)
const selection = ref<combobox.SelectionDetails | null>(null)

const collection = computed(() =>
  combobox.collection({
    items: items.value,
    itemToValue: (item) => item.href,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    collection: collection.value,
    onSelect: (details: combobox.SelectionDetails) => (selection.value = details),
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      items.value = links.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase()))
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Go to page</label>
      <div v-bind="api.getControlProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div data-testid="combobox-content" v-bind="api.getContentProps()">
        <a v-for="item in items" :key="item.href" :href="item.href" v-bind="api.getItemProps({ item })">
          {{ item.label }}
        </a>
      </div>
    </div>
    <pre data-testid="selection">{{ JSON.stringify(selection) }}</pre>
  </main>
</template>
