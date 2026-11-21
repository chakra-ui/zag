<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

const options = ref(comboboxData)
const selected = ref("")

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const service = useMachine(combobox.machine, {
  id: useId(),
  get collection() {
    return collection.value
  },
  inline: true,
  inputBehavior: "autohighlight",
  onInputValueChange({ inputValue }) {
    options.value = comboboxData.filter((item) => contains(item.label, inputValue))
  },
  onSelect({ itemValue }) {
    selected.value = collection.value.stringify(itemValue) ?? ""
  },
})

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <output data-testid="selected">Selected: {{ selected }}</output>
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
      </div>
      <ul v-bind="api.getListProps()">
        <li v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })">
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>
