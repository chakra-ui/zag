<script setup lang="ts">
import * as autocomplete from "@zag-js/autocomplete"
import { getCaretPosition, raf } from "@zag-js/dom-query"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

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

const value = ref("")
const searchValue = ref("")
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const items = computed(() => comboboxData.filter((item) => contains(item.label, searchValue.value)))

const collection = computed(() =>
  autocomplete.collection<Item>({
    items: items.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  autocomplete.machine as autocomplete.Machine<Item>,
  computed<autocomplete.Props<Item>>(() => ({
    id,
    collection: collection.value,
    value: value.value,
    onValueChange: (details) => {
      value.value = details.value
    },
    autoHighlight: true,
    openOnKeyPress: false,
    openOnChange: false,
    positioning: {
      sameWidth: false,
      placement: "bottom-start",
      gutter: 16,
      getAnchorRect() {
        return getAnchorRect(textareaRef.value)
      },
    },
    onSelect(details) {
      const textarea = textareaRef.value
      if (!textarea) return
      const offset = getTriggerOffset(textarea)
      const nextValue = replaceValue(offset, getSearchValue(textarea), details.value)(textarea.value)
      // selecting writes the label into the value; swap in the full text after
      raf(() => {
        api.value.setValue(nextValue)
        searchValue.value = ""
      })
    },
  })),
)

const api = computed(() => autocomplete.connect(service, normalizeProps))

const textareaProps = computed(() =>
  mergeProps(api.value.getInputProps() as Record<string, any>, {
    rows: 5,
    placeholder: "Type @ to see completion",
    style: { width: "400px", padding: "4px", border: "1px solid var(--z-border)" },
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
      const nextSearchValue = getSearchValue(target)

      if (trigger) {
        api.value.setOpen(true)
      } else if (!nextSearchValue) {
        api.value.setOpen(false)
      }

      searchValue.value = nextSearchValue
    },
  }),
)
</script>

<template>
  <main class="autocomplete">
    <div v-bind="api.getRootProps()">
      <span>Search value: {{ searchValue || "-" }}</span>
      <label v-bind="api.getLabelProps()">Select country</label>
      <textarea ref="textareaRef" v-bind="textareaProps" />
    </div>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <ul v-bind="api.getListProps()">
          <li v-for="item in items" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>
