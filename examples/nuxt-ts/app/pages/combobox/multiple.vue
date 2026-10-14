<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const controls = useControls({
  removeSelected: {
    type: "boolean",
    defaultValue: false,
  },
})

const options = ref(comboboxData)
const selectedValue = ref<string[]>([])

const items = computed(() =>
  controls.context.value.removeSelected
    ? options.value.filter((item) => !selectedValue.value.includes(item.code))
    : options.value,
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
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : comboboxData
    },
    multiple: true,
    onValueChange({ value }) {
      selectedValue.value = value
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div>
      <b>{{ service.state.get() }}</b>
      <b> / {{ api.highlightedValue || "-" }}</b>
      <pre data-testid="value-text">{{ api.valueAsString }}</pre>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select country</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button
            data-testid="trigger"
            v-bind="mergeProps(api.getTriggerProps(), { onClick: () => (options = comboboxData) })"
          >
            ▼
          </button>
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
