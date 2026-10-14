<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ onValueChange?: (details: combobox.ValueChangeDetails) => void }>()

const { contains } = createFilter({ sensitivity: "base" })

const inputValue = ref("")

const items = computed(() =>
  comboboxData.filter((item) => contains(item.label, inputValue.value) || contains(item.code, inputValue.value)),
)

const collection = computed(() =>
  combobox.collection({
    items: items.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    disableLayer: true,
    open: true,
    placeholder: "Search items...",
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
    onInputValueChange(details: combobox.InputValueChangeDetails) {
      inputValue.value = details.inputValue
    },
    collection: collection.value,
    onValueChange: props.onValueChange,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="mergeProps(api.getRootProps(), { style: { width: '100%' } })">
    <input v-bind="mergeProps(api.getInputProps(), { style: { marginBottom: '12px' } })" />
    <div v-bind="mergeProps(api.getContentProps(), { style: { minHeight: '120px' } })">
      <div v-bind="api.getListProps()">
        <div v-if="items.length === 0">No results found</div>
        <div v-for="item in items" :key="item.label" v-bind="api.getItemProps({ item, persistFocus: true })">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>
