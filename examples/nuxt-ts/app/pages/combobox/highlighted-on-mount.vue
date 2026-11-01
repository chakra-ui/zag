<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

useHead({
  style: [{ innerHTML: "html, body, .page, .page main { height: auto !important; overflow: visible !important; }" }],
})

const collection = combobox.collection({
  items: comboboxData,
  itemToValue: (item) => item.code,
  itemToString: (item) => item.label,
})

const service = useMachine(combobox.machine, {
  id: useId(),
  collection,
  open: true,
  disableLayer: true,
  defaultHighlightedValue: comboboxData[0].code,
})

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div data-testid="spacer" style="height: 150vh" />
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
      </div>
      <ul data-testid="combobox-content" v-bind="api.getContentProps()" style="max-height: 12rem; overflow: auto">
        <li v-for="item in comboboxData" :key="item.code" :data-testid="item.code" v-bind="api.getItemProps({ item })">
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>
