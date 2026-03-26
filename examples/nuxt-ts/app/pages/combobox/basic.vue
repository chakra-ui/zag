<script setup lang="ts">
import styles from "../../../../../shared/src/css/combobox.module.css"
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"

const controls = useControls(comboboxControls)
const { contains } = createFilter({ sensitivity: "base" })

const options = ref(comboboxData)
const collectionRef = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const service = useMachine(
  combobox.machine,
  controls.mergeProps<combobox.Props>({
    id: useId(),
    get collection() {
      return collectionRef.value
    },
    onOpenChange() {
      options.value = comboboxData
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : comboboxData
    },
  }),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div>
      <button @click="() => api.setValue(['TG'])">Set to Togo</button>
      <button data-testid="clear-value-button" @click="() => api.clearValue()">Clear Value</button>

      <br />

      <div v-bind="api.getRootProps()" :class="styles.Root">
        <label v-bind="api.getLabelProps()" :class="styles.Label">Select country</label>

        <div v-bind="api.getControlProps()" :class="styles.Control">
          <input data-testid="input" v-bind="api.getInputProps()" :class="styles.Input" />
          <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
          <button v-bind="api.getClearTriggerProps()" :class="styles.ClearTrigger">
            <XIcon />
          </button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <ul v-if="options.length > 0" data-testid="combobox-content" v-bind="api.getContentProps()" :class="styles.Content">
          <li v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })" :class="styles.Item">
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
