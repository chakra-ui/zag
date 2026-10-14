<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
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
    onValueChange: (e) => {
      value.value = e.value
    },
    onOpenChange: () => {
      options.value = frameworks
    },
    onInputValueChange: ({ inputValue }) => {
      const filtered = frameworks.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : frameworks
    },
    placeholder: "Type to search",
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

const setSolid = () => {
  options.value = frameworks
  value.value = ["solid"]
}
</script>

<template>
  <main class="combobox" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
      <div style="font-size: 0.875rem">
        <strong>Selected:</strong> {{ value.length > 0 ? value.join(", ") : "N/A" }}
        <pre style="max-width: 400px; overflow: auto">{{ JSON.stringify(collection.toString(), null, 2) }}</pre>
      </div>

      <div>
        <label v-bind="api.getLabelProps()">Select framework</label>
        <div v-bind="api.getControlProps()" style="display: flex; margin-top: 4px">
          <input
            data-testid="input"
            v-bind="api.getInputProps()"
            style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px"
          />
          <button data-testid="trigger" v-bind="api.getTriggerProps()" style="padding: 8px">▼</button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <div
          data-testid="combobox-content"
          v-bind="api.getContentProps()"
          style="
            list-style: none;
            margin: 0;
            padding: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-top: 4px;
            max-height: 200px;
            overflow: auto;
          "
        >
          <div v-bind="api.getListProps()">
            <div
              v-for="item in options"
              :key="item.value"
              :data-testid="item.value"
              v-bind="api.getItemProps({ item })"
              style="padding: 8px 12px; cursor: pointer"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>

      <button
        data-testid="set-solid-button"
        style="
          padding: 8px 16px;
          background-color: #3182ce;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        "
        @click="setSolid"
      >
        Set value to &quot;Solid&quot; externally
      </button>
    </div>
  </main>
</template>
