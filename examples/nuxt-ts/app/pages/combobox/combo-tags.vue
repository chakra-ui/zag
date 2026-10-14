<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { contains } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"
import "@styles/tags-input.css"

const { contains: matchContains } = createFilter({ sensitivity: "base" })

// Shared ids so tags input and combobox compose on the same elements
const ids = {
  root: useId(),
  input: useId(),
  control: useId(),
}

const contentRef = ref<HTMLDivElement | null>(null)

const options = ref(comboboxData)
const value = ref<string[]>([])

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const comboboxId = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id: comboboxId,
    collection: collection.value,
    ids,
    allowCustomValue: true,
    multiple: true,
    selectionBehavior: "clear" as const,
    value: value.value,
    onOpenChange() {
      options.value = comboboxData.filter((item) => !value.value.includes(item.code))
    },
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      options.value = comboboxData.filter((item) => matchContains(item.label, inputValue))
    },
    onValueChange(details: combobox.ValueChangeDetails) {
      // sync tags input value and options
      queueMicrotask(() => {
        value.value = details.value
        options.value = options.value.filter((item) => !details.value.includes(item.code))
        contentRef.value?.scrollTo(0, 0)
      })
    },
  })),
)

const comboboxApi = computed(() => combobox.connect(service, normalizeProps))

const tagsId = useId()
const tagService = useMachine(
  tagsInput.machine,
  computed(() => ({
    id: tagsId,
    ids,
    editable: false,
    addOnPaste: false,
    onInteractOutside(event: tagsInput.InteractOutsideEvent) {
      const { target } = event.detail.originalEvent
      if (contains(contentRef.value, target)) {
        event.preventDefault()
      }
    },
    inputValue: comboboxApi.value.inputValue,
    value: value.value,
    onValueChange(details: tagsInput.ValueChangeDetails) {
      value.value = details.value
    },
    onInputValueChange({ inputValue }: tagsInput.InputValueChangeDetails) {
      comboboxApi.value.setInputValue(inputValue)
    },
  })),
)

const tagApi = computed(() => tagsInput.connect(tagService, normalizeProps))

const inputProps = computed(() =>
  mergeProps(comboboxApi.value.getInputProps(), tagApi.value.getInputProps(), {
    onKeydown(event: KeyboardEvent) {
      // add tag on Enter when nothing matches
      if (event.key === "Enter" && options.value.length === 0) {
        tagApi.value.addValue(comboboxApi.value.inputValue)
      }
    },
  }),
)
</script>

<template>
  <main class="combobox">
    <div v-bind="mergeProps(comboboxApi.getRootProps(), tagApi.getRootProps())">
      <label v-bind="comboboxApi.getLabelProps()">Select country</label>

      <div v-bind="mergeProps(comboboxApi.getControlProps(), tagApi.getControlProps())">
        <span v-for="(tag, index) in tagApi.value" :key="tag" v-bind="tagApi.getItemProps({ index, value: tag })">
          <div v-bind="tagApi.getItemPreviewProps({ index, value: tag })">
            <span v-bind="tagApi.getItemTextProps({ index, value: tag })">{{ tag }} </span>
            <button v-bind="tagApi.getItemDeleteTriggerProps({ index, value: tag })">&#x2715;</button>
          </div>
          <input v-bind="tagApi.getItemInputProps({ index, value: tag })" />
        </span>

        <input data-testid="input" placeholder="add tag" v-bind="inputProps" />
      </div>
    </div>

    <div v-bind="comboboxApi.getPositionerProps()">
      <div data-testid="combobox-content" v-bind="comboboxApi.getContentProps()">
        <div v-if="options.length > 0" ref="contentRef" v-bind="comboboxApi.getListProps()">
          <div
            v-for="item in options"
            :key="item.code"
            :data-testid="item.code"
            v-bind="comboboxApi.getItemProps({ item })"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
