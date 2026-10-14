<script setup lang="ts">
import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tags-input.css"

function toKey(value: string, index: number) {
  const safe = value.replace(/\s/g, "space").replace(/,/g, "comma")
  return `${safe}-${index}`
}

// Sentence builder: tokens can repeat, with different separators per item
const service = useMachine(tagsInput.machine, {
  id: useId(),
  defaultValue: ["Hello", ",", " ", "world", "!"],
  allowDuplicates: true,
  delimiter: /[,\s]+/,
  addOnPaste: true,
  editable: true,
})

const api = computed(() => tagsInput.connect(service, normalizeProps))
</script>

<template>
  <main class="tags-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Sentence builder (tokens can repeat):</label>
      <div v-bind="api.getControlProps()">
        <span
          v-for="(value, index) in api.value"
          :key="toKey(value, index)"
          v-bind="api.getItemProps({ index, value })"
        >
          <div v-bind="api.getItemPreviewProps({ index, value })">
            <span v-bind="api.getItemTextProps({ index, value })">{{ value }} </span>
            <button v-bind="api.getItemDeleteTriggerProps({ index, value })">
              <XIcon />
            </button>
          </div>
          <input v-bind="api.getItemInputProps({ index, value })" />
        </span>
        <input
          placeholder='Add tokens: type "Hello" or paste "a, b, a" (comma/space splits)'
          v-bind="api.getInputProps()"
        />
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
