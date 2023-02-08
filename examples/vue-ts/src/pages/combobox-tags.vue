<template>
  <main class="combobox">
    <div>
      <div v-bind="api.rootProps">
        <label v-bind="api.labelProps">Select countries</label>

        <div v-bind="api.controlProps" class="combobox-tags">
          <div v-bind="tagsApi.rootProps" class="combobox-tags-input">
            <span v-for="(value, index) in tagsApi.value" :key="index">
              <div v-bind="tagsApi.getTagProps({ index, value })">
                <span>{{ value }}</span>
                <button v-bind="tagsApi.getTagDeleteTriggerProps({ index, value })">&#x2715;</button>
              </div>
              <input v-bind="tagsApi.getTagInputProps({ index, value })" />
            </span>
            <input v-bind="inputProps" placeholder="Add tag..." />
          </div>
          <button v-bind="api.triggerProps">▼</button>
        </div>
      </div>

      <div v-bind="api.positionerProps">
        <ul v-if="options.length > 0" v-bind="api.contentProps">
          <li
            v-for="(item, index) in options"
            :key="index"
            v-bind="getOptionProps({ label: item.label, value: item.code, index, disabled: item.disabled })"
          >
            <span v-if="isSelected(item.label)">✓</span>
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import * as tagsInput from "@zag-js/tags-input"
import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, ref } from "vue"
import type { OptionProps } from "@zag-js/combobox/src/combobox.types"

const comboboxOptions = ref(comboboxData)
const options = ref(comboboxData)

const addValueToOptionsIfNeeded = (value: string) => {
  if (!comboboxOptions.value.some((item) => item.label === value)) {
    comboboxOptions.value.push({
      label: value,
      code: value,
    })
  }
}

const [tagsState, tagsSend] = useMachine(
  tagsInput.machine({
    id: "combobox",
    ids: {
      input: "combobox-tags",
    },
    value: [],
    allowEditTag: false,
    onChange({ values }) {
      const latestValue = values[values.length - 1]
      if (latestValue != null) {
        addValueToOptionsIfNeeded(latestValue)
      }
    },
  }),
)
const tagsApi = computed(() => tagsInput.connect(tagsState.value, tagsSend, normalizeProps))

const [state, send] = useMachine(
  combobox.machine({
    id: "combobox",
    ids: {
      input: "combobox-tags",
    },
    onOpen() {
      options.value = [...comboboxOptions.value]
    },
    onInputChange({ value }) {
      const filtered = comboboxOptions.value.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
      const newOptions = filtered.length > 0 ? filtered : [...comboboxOptions.value]
      if (value && newOptions[0].label.toLowerCase() !== value.toLowerCase()) {
        newOptions.unshift({
          label: value,
          code: value,
        })
      }
      options.value = [...newOptions]
    },
    onSelect({ label: newValue }) {
      if (newValue == null) {
        return
      }
      const oldValues = [...tagsApi.value.value]
      const valueIndex = oldValues.indexOf(newValue)
      if (valueIndex > -1) {
        oldValues.splice(valueIndex, 1)
        tagsApi.value.setValue(oldValues)
      } else {
        tagsApi.value.setValue([...oldValues, newValue])
      }
      api.value.clearValue()
    },
  }),
)

const api = computed(() => combobox.connect(state.value, send, normalizeProps))

const inputProps = computed(() => {
  const tagsProps = tagsApi.value.inputProps
  const comboboxProps = api.value.inputProps

  function onKeydown(event: KeyboardEvent) {
    comboboxProps?.onKeydown?.(event)

    // Adding tags with enter is handled by combobox onSelect when open
    if (api.value.isOpen && event.key === "Enter") {
      return
    }
    tagsProps?.onKeydown?.(event)
  }

  return { ...mergeProps(tagsProps, comboboxProps), onKeydown }
})

const isSelected = (label: string) => tagsApi.value.value.includes(label)

const getOptionProps = (option: OptionProps) => ({
  ...api.value.getOptionProps(option),
  // Selected options are defined by tags
  ["aria-selected"]: isSelected(option.label),
  ["data-checked"]: null,
})
</script>

<style lang="css" scoped>
.combobox-tags {
  border: 1px solid gray;
}

.combobox-tags:focus-within {
  outline: 2px solid blue;
}

.combobox-tags-input {
  display: flex;
  width: 400px;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 4px;
}

.combobox-tags-input input {
  min-width: 100px;
  border: none;
}

.combobox-tags-input input:focus {
  outline: none;
}
</style>
