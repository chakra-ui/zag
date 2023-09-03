<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(comboboxControls)

const options = ref(comboboxData)
const collectionRef = computed(() =>
  combobox.collection({
    items: options.value,
    getItemKey: (item) => item.code,
    getItemLabel: (item) => item.label,
  }),
)

const [state, send] = useMachine(
  combobox.machine({
    id: "1",
    collection: collectionRef.value,
    onOpenChange(open) {
      if (!open) return
      options.value = comboboxData
    },
    onInputChange({ value }) {
      const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
      options.value = filtered.length > 0 ? filtered : comboboxData
    },
  }),
  {
    context: computed(() => ({
      ...controls.context.value,
      collection: collectionRef.value,
    })),
  },
)

const api = computed(() => combobox.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div>
      <button @click="() => api.setValue(['TG'])">Set to Togo</button>
      <button data-testid="clear-value-button" @click="api.clearValue">Clear Value</button>

      <br />

      <div v-bind="api.rootProps">
        <label v-bind="api.labelProps">Select country</label>

        <div v-bind="api.controlProps">
          <input data-testid="input" v-bind="api.inputProps" />
          <button data-testid="trigger" v-bind="api.triggerProps">▼</button>
        </div>
      </div>

      <div v-bind="api.positionerProps">
        <ul v-if="options.length > 0" data-testid="combobox-content" v-bind="api.contentProps">
          <li v-for="(item, index) in options" :key="`${item.code}:${index}`" v-bind="api.getItemProps({ item })">
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" :omit="['collection']" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
