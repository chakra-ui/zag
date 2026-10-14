<script setup lang="ts">
import type { ListCollection } from "@zag-js/collection"
import * as combobox from "@zag-js/combobox"
import type { commandData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{
  matches: Record<string, commandData.Command[]>
  collection: ListCollection<commandData.Command>
}>()

const emit = defineEmits<{
  valueChange: [details: combobox.ValueChangeDetails<commandData.Command>]
  inputValueChange: [details: combobox.InputValueChangeDetails]
}>()

const matchEntries = computed(() => Object.entries(props.matches))

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<commandData.Command>,
  computed(() => ({
    open: true,
    disableLayer: true,
    placeholder: "Type a command or search term...",
    loopFocus: false,
    collection: props.collection,
    onValueChange: (details: combobox.ValueChangeDetails<commandData.Command>) => emit("valueChange", details),
    onInputValueChange: (details: combobox.InputValueChangeDetails) => emit("inputValueChange", details),
    id,
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="mergeProps(api.getRootProps(), { style: { width: '100%' } })">
    <input v-bind="mergeProps(api.getInputProps(), { style: { marginBottom: '12px' } })" />
    <div v-bind="mergeProps(api.getContentProps(), { style: { minHeight: '120px' } })">
      <div v-bind="api.getListProps()">
        <div v-if="matchEntries.length === 0">No results found</div>
        <div v-for="[group, items] in matchEntries" :key="group" v-bind="api.getItemGroupProps({ id: group })">
          <div v-bind="api.getItemGroupLabelProps({ htmlFor: group })">{{ group }}</div>
          <div v-for="item in items" :key="item.name" v-bind="api.getItemProps({ item, persistFocus: true })">
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
