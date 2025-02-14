<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import { matchSorter } from "match-sorter"

const controls = useControls(comboboxControls)

const options = ref(comboboxData)
const collectionRef = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const service = useMachine(combobox.machine, {
  id: useId(),
  get collection() {
    return collectionRef.value
  },
  onOpenChange() {
    options.value = comboboxData
  },
  onInputValueChange({ inputValue }) {
    const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
    options.value = filtered.length > 0 ? filtered : comboboxData
  },
})

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div>
      <button @click="() => api.setValue(['TG'])">Set to Togo</button>
      <button data-testid="clear-value-button" @click="() => api.clearValue()">Clear Value</button>
      <button v-bind="api.getClearTriggerProps()">
        <XIcon />
      </button>
      <br />

      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select country</label>

        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <ul v-if="options.length > 0" data-testid="combobox-content" v-bind="api.getContentProps()">
          <li v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })">
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
