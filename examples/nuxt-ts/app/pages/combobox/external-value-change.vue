<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
  { label: "Qwik", value: "qwik" },
  { label: "Lit", value: "lit" },
  { label: "Alpine.js", value: "alpinejs" },
  { label: "Ember", value: "ember" },
  { label: "Next.js", value: "nextjs" },
]

const { contains } = createFilter({ sensitivity: "base" })

const value = ref<string[]>(["react"])
const options = ref(frameworks)

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    value: value.value,
    onValueChange: (details) => {
      value.value = details.value
    },
    // Reset on close so reopening shows every option, not the last filtered list
    onOpenChange: ({ open }) => {
      if (!open) options.value = frameworks
    },
    onInputValueChange: ({ inputValue, reason }) => {
      // Selection and external values also set the input; only typing should filter
      if (reason !== "input-change") {
        options.value = frameworks
        return
      }
      options.value = frameworks.filter((item) => contains(item.label, inputValue))
    },
    placeholder: "Type to search",
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

// The selected item may be filtered out, so the external value must still resolve
function setExternalValue(next: string[]) {
  options.value = frameworks
  value.value = next
}
</script>

<template>
  <main class="combobox">
    <div class="vstack gap-6">
      <div class="hstack">
        <button data-testid="set-solid-button" @click="setExternalValue(['solid'])">Set to Solid</button>
        <button @click="setExternalValue(['svelte'])">Set to Svelte</button>
        <button @click="setExternalValue([])">Clear</button>
      </div>

      <div class="hstack gap-4 items-start">
        <Output label="value" :value="value" />
        <Output label="inputValue" :value="api.inputValue" />
      </div>

      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Framework</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <button data-testid="trigger" v-bind="api.getTriggerProps()">
            <ChevronsUpDownIcon />
          </button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <div data-testid="combobox-content" v-bind="api.getContentProps()">
          <div v-bind="api.getEmptyProps()">{{ options.length === 0 ? "No frameworks found" : "" }}</div>
          <div v-if="options.length > 0" v-bind="api.getListProps()">
            <div
              v-for="item in options"
              :key="item.value"
              :data-testid="item.value"
              v-bind="api.getItemProps({ item })"
            >
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">
                <CheckIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
