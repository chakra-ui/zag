<script setup lang="ts">
import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tags-input.css"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

// Only lowercase alphabetic tags; duplicates are prevented by default
const invalidReason = ref<string | null>(null)

const service = useMachine(tagsInput.machine, {
  id: useId(),
  defaultValue: ["react", "vue"],
  validate(details) {
    return /^[a-z]+$/.test(details.inputValue)
  },
  onValueChange() {
    invalidReason.value = null
  },
  onValueInvalid(details) {
    invalidReason.value = details.reason
  },
})

const api = computed(() => tagsInput.connect(service, normalizeProps))
</script>

<template>
  <main class="tags-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Lowercase letters only:</label>
      <div v-bind="api.getControlProps()">
        <span
          v-for="(value, index) in api.value"
          :key="`${toDashCase(value)}-tag-${index}`"
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
        <input placeholder="Try: svelte or React (rejected)" v-bind="api.getInputProps()" />
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
      </div>
      <p v-if="invalidReason" style="margin-top: 8px; font-size: 14px; color: red">Invalid: {{ invalidReason }}</p>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
