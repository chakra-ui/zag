<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import { useListVirtualizer } from "~/composables/useVirtualizer"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const options = ref(comboboxData)

const { virtualizer, ref: rootRef } = useListVirtualizer(() => ({
  count: options.value.length,
  itemSize: 32,
  observeScrollElementSize: true,
}))

const collection = computed(() =>
  combobox.collection({
    items: options.value,
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
    scrollToIndexFn(details: { index: number; immediate?: boolean }) {
      virtualizer.value.scrollToIndex(details.index, { align: details.immediate ? "center" : "auto" })
    },
    onOpenChange() {
      options.value = comboboxData
    },
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : comboboxData
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox">
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
        <div v-bind="mergeProps(virtualizer.getRootProps(), api.getListProps())" :ref="rootRef">
          <div v-bind="virtualizer.getContentProps()">
            <template v-for="vi in virtualizer.getVirtualItems()" :key="options[vi.index]?.code ?? vi.index">
              <!-- The count syncs before paint; skip rows from the previous one -->
              <div
                v-if="options[vi.index]"
                :data-testid="options[vi.index]!.code"
                v-bind="mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item: options[vi.index]! }))"
              >
                <span>{{ options[vi.index]!.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item: options[vi.index]! })">✅</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
