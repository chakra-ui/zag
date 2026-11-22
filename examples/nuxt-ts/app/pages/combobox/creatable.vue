<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

const { contains } = createFilter({ sensitivity: "base" })

// Fake server: slow, abortable, and rejects labels starting with "x"
function saveLabel(label: string, signal: AbortSignal) {
  return new Promise<Item>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (/^x/i.test(label)) reject(new Error(`"${label}" is reserved`))
      else resolve(toItem(label))
    }, 800)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

const items = ref(initialItems)
const query = ref("")

const filtered = computed(() => items.value.filter((item) => contains(item.label, query.value.trim())))

const collection = computed(() =>
  combobox.collection({
    items: filtered.value,
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
    autoHighlight: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") query.value = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason !== "input-change") return
      query.value = inputValue
    },
    async onCreate({ inputValue, signal }) {
      const item = await saveLabel(inputValue, signal)
      items.value = [...items.value, item]
      return item.value
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
const create = computed(() => api.value.getCreateItemState())
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" placeholder="Search or create" />
        <button v-bind="api.getTriggerProps()">▼</button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
    </div>
    <pre data-testid="value">value: {{ JSON.stringify(api.value) }}</pre>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="item in filtered" :key="item.value" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </div>
          <div v-bind="api.getCreateItemProps()">
            <span>{{ create.pending ? `Creating "${create.inputValue}"…` : `Create "${create.inputValue}"` }}</span>
            <span v-if="create.error" class="combobox-create-error">{{ create.error.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
