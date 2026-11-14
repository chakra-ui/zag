<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

const props = defineProps<{
  label: string
  items: string[]
  format: (value: string) => string
}>()

const id = useId()
const inputValue = ref("")

const collection = computed(() =>
  combobox.collection({ items: props.items.filter((item) => item.includes(inputValue.value)) }),
)

const service = useMachine(
  combobox.machine,
  computed<combobox.Props>(() => ({
    id,
    collection: collection.value,
    inputValue: inputValue.value,
    onInputValueChange(details) {
      inputValue.value = props.format(details.inputValue)
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <div>
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">{{ label }}</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getTriggerProps()">▼</button>
      </div>
      <output>{{ inputValue }}</output>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="item in collection.items" :key="item" v-bind="api.getItemProps({ item })">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
