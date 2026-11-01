<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

interface Item {
  label: string
  value: string
}

const props = defineProps<{
  label?: string
  collection: listbox.ListCollection<Item>
  value: string[]
}>()

const emit = defineEmits<{ valueChange: [details: listbox.ValueChangeDetails<Item>] }>()

const id = useId()
const service = useMachine(
  listbox.machine as listbox.Machine<Item>,
  computed(() => ({
    id,
    selectionMode: "multiple" as const,
    collection: props.collection,
    value: props.value,
    onValueChange: (details: listbox.ValueChangeDetails<Item>) => emit("valueChange", details),
  })),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="mergeProps(api.getRootProps(), { style: { flex: '1' } })">
    <label v-if="label" v-bind="api.getLabelProps()">{{ label }}</label>
    <div v-bind="mergeProps(api.getContentProps(), { style: { width: '100%', height: '100%' } })">
      <ul v-bind="mergeProps(api.getListProps(), { style: { width: '100%', height: '100%' } })">
        <li v-for="item in collection.items" :key="item.value" v-bind="api.getItemProps({ item })">
          <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
          <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
        </li>
      </ul>
    </div>
  </div>
</template>
