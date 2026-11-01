<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const controls = useControls(comboboxControls)

const options = ref(comboboxData)
const selectedItems = ref<Item[]>([])
const open = ref(false)

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const controlProps = controls.mergeProps({})

const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    open: open.value,
    onOpenChange(details) {
      open.value = details.open
      options.value = comboboxData
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : comboboxData
    },
    onValueChange({ items }) {
      selectedItems.value = items
    },
    ...controlProps.value,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div>
      <button @click="api.setValue(['TG'])">Set to Togo</button>
      <button data-testid="clear-value-button" @click="api.clearValue()">Clear Value</button>
      <button @click="open = !open">Toggle (external)</button>
      <pre data-testid="on-value-change-items">
selectedItems: {{ selectedItems.map((item) => item.label).join(", ") || "N/A" }}</pre>
      <br />
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select country</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
      <div v-bind="api.getPositionerProps()">
        <div data-testid="combobox-content" v-bind="api.getContentProps()">
          <div v-if="options.length > 0" v-bind="api.getListProps()">
            <div v-for="item in options" :key="item.code" :data-testid="item.code" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
              <span>{{ item.label }}</span>
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
