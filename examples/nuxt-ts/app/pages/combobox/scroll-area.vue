<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as scrollArea from "@zag-js/scroll-area"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"
import "@styles/scroll-area.css"

const { contains } = createFilter({ sensitivity: "base" })

const options = ref(comboboxData)
const collectionRef = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

// The content doubles as the scroll area viewport, so both machines share one id
const contentId = useId()

const service = useMachine(combobox.machine, {
  id: useId(),
  ids: { content: contentId },
  get collection() {
    return collectionRef.value
  },
  defaultValue: ["TG"],
  onOpenChange() {
    options.value = comboboxData
  },
  onInputValueChange({ inputValue }) {
    const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
    options.value = filtered.length > 0 ? filtered : comboboxData
  },
})

const api = computed(() => combobox.connect(service, normalizeProps))

const scrollAreaService = useMachine(scrollArea.machine, {
  id: useId(),
  ids: { viewport: contentId },
})

const scrollAreaApi = computed(() => scrollArea.connect(scrollAreaService, normalizeProps))
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select country</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getTriggerProps()">▼</button>
      </div>
    </div>
    <div v-bind="api.getPositionerProps()">
      <div
        v-bind="
          mergeProps(scrollAreaApi.getRootProps(), api.getContentProps(), { style: { width: 'auto', height: 'auto' } })
        "
      >
        <ul
          v-bind="
            mergeProps(scrollAreaApi.getViewportProps(), api.getListProps(), {
              style: { scrollbarWidth: 'none', outline: 'none' },
            })
          "
        >
          <li v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
        <div v-bind="scrollAreaApi.getScrollbarProps({ orientation: 'vertical' })">
          <div v-bind="scrollAreaApi.getThumbProps({ orientation: 'vertical' })" />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>
