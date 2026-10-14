<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { getCaretPosition, raf } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

const defaultTriggers = ["@", "#"]

function getTriggerOffset(element: HTMLTextAreaElement | null, triggers = defaultTriggers) {
  if (!element) return -1

  const { value, selectionStart } = element
  for (let i = selectionStart; i >= 0; i--) {
    const char = value[i]
    if (char && triggers.includes(char)) {
      return i
    }
  }

  return -1
}

function getTrigger(element: HTMLTextAreaElement, triggers = defaultTriggers) {
  const { value, selectionStart } = element
  const previousChar = value[selectionStart - 1]
  if (!previousChar) return null
  const secondPreviousChar = value[selectionStart - 2]
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar)
  if (!isIsolated) return null
  if (triggers.includes(previousChar)) return previousChar
  return null
}

function getSearchValue(element: HTMLTextAreaElement, triggers = defaultTriggers) {
  const offset = getTriggerOffset(element, triggers)
  if (offset === -1) return ""
  return element.value.slice(offset + 1, element.selectionStart)
}

function getAnchorRect(element: HTMLTextAreaElement | null, triggers = defaultTriggers) {
  if (!element) return null
  const offset = getTriggerOffset(element, triggers)
  const { left, top, height } = getCaretPosition(element, { position: offset + 1 })
  const { x, y } = element.getBoundingClientRect()
  return { x: x + left, y: y + top, height }
}

function replaceValue(offset: number, searchValue: string, displayValue: string) {
  return (inputValue: string) => {
    return `${inputValue.slice(0, offset) + displayValue} ${inputValue.slice(offset + searchValue.length + 1)}`
  }
}

const options = ref(comboboxData)
const searchValue = ref("")
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const collection = computed(() =>
  combobox.collection({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

watch(searchValue, (value) => {
  options.value = comboboxData.filter((item) => contains(item.label, value))
})

const id = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    collection: collection.value,
    onOpenChange() {
      options.value = comboboxData
    },
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "preserve" as const,
    openOnKeyPress: false,
    openOnChange: false,
    allowCustomValue: true,
    positioning: {
      sameWidth: false,
      placement: "bottom-start" as const,
      gutter: 16,
      getAnchorRect() {
        return getAnchorRect(textareaRef.value)
      },
    },
    onValueChange({ value }: combobox.ValueChangeDetails) {
      const textarea = textareaRef.value
      if (!textarea) return
      const valueAsString = collection.value.stringifyMany(value)
      const offset = getTriggerOffset(textarea)
      const inputValue = replaceValue(offset, searchValue.value, valueAsString)(textarea.value)
      raf(() => {
        api.value.setInputValue(inputValue)
      })
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

const textareaProps = computed(() =>
  mergeProps(api.value.getInputProps() as Record<string, any>, {
    rows: 5,
    placeholder: "Type @ to see completion",
    style: { width: "400px", padding: "4px" },
    onScroll() {
      api.value.reposition()
    },
    onPointerdown() {
      api.value.setOpen(false)
    },
    onKeydown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        api.value.setOpen(false)
      }
    },
    onInput(event: Event) {
      const target = event.currentTarget as HTMLTextAreaElement
      const trigger = getTrigger(target)
      const value = getSearchValue(target)

      if (trigger) {
        api.value.setOpen(true)
      } else if (!value) {
        api.value.setOpen(false)
      }

      searchValue.value = value
    },
  }),
)
</script>

<template>
  <main class="combobox">
    <div v-bind="api.getRootProps()">
      <span>Search value: {{ searchValue || "-" }}</span>
      <label v-bind="api.getLabelProps()">Select country</label>
      <textarea ref="textareaRef" v-bind="textareaProps" />
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="item in options" :key="item.code" v-bind="api.getItemProps({ item })">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['collection', 'nextEvents']" />
  </Toolbar>
</template>
