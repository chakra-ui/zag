<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/utils/search"
import { comboboxControls, groupedData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

type Item = (typeof groupedData)[number]

const { contains } = createFilter({ sensitivity: "base" })

const controls = useControls(comboboxControls)

const options = ref(groupedData)
const collection = computed(() => combobox.collection({ items: options.value, groupBy: (item) => item.type }))

const id = useId()
const controlProps = controls.mergeProps({})

const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    onOpenChange({ open }: combobox.OpenChangeDetails) {
      if (!open) options.value = groupedData
    },
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      const filtered = groupedData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : groupedData
    },
    ...controlProps.value,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select produce</label>
      <div v-bind="api.getControlProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
        <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div v-if="options.length > 0" v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="[type, items] in collection.group()" :key="type" v-bind="api.getItemGroupProps({ id: type })">
            <div v-bind="api.getItemGroupLabelProps({ htmlFor: type })">{{ type }}</div>
            <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
