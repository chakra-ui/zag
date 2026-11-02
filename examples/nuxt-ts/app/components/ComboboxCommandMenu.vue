<script setup lang="ts">
import type { PageListCollection } from "@zag-js/collection"
import * as combobox from "@zag-js/combobox"
import { createFuzzySearch } from "@zag-js/fuzzy"
import type { commandData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

type Item = commandData.PageItem

const props = defineProps<{
  pages: PageListCollection<Item>
  query: string
}>()

const emit = defineEmits<{
  navigate: [pages: PageListCollection<Item>, query: string]
  queryChange: [query: string]
  action: [item: Item]
}>()

const fuzzy = createFuzzySearch<Item>({ itemToString: (item) => item.label, itemToKeywords: (item) => item.keywords })

// search the open page and everything nested in it
const collection = computed(() =>
  props.pages.setItems(
    fuzzy.search(props.query ? props.pages.getDescendants() : props.pages.getChildren(), props.query),
  ),
)

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    inline: true,
    collection: collection.value,
    inputValue: props.query,
    placeholder: props.pages.pageItem ? `Search ${props.pages.pageItem.label}...` : "Type a command or search...",
    loopFocus: false,
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
    onInputValueChange: ({ inputValue }: combobox.InputValueChangeDetails) => emit("queryChange", inputValue),
    onSelect: ({ itemValue }: combobox.SelectionDetails) => {
      const item = props.pages.getItem(itemValue)
      if (!item) return
      if (props.pages.isPage(item)) emit("navigate", props.pages.setPage(itemValue, props.query), "")
      else emit("action", item)
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

// highlight the item we came back from once its page is showing
watch(
  () => props.pages,
  (pages) => {
    const { highlightedValue } = pages.restore
    if (highlightedValue && collection.value.has(highlightedValue)) api.value.setHighlightedValue(highlightedValue)
  },
  { flush: "post" },
)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Backspace" || props.query || !props.pages.page) return
  event.preventDefault()
  const next = props.pages.up(props.query)
  emit("navigate", next, next.restore.query)
}
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-if="pages.page" data-part="breadcrumbs">
      <span v-for="page in pages.getPath()" :key="page.value">{{ page.label }}</span>
    </div>
    <input v-bind="api.getInputProps()" @keydown="onKeydown" />
    <div v-bind="api.getContentProps()">
      <div v-bind="api.getEmptyProps()">{{ collection.size === 0 ? "No results found" : "" }}</div>
      <div v-bind="api.getListProps()">
        <div v-for="[group, items] in collection.group()" :key="group" v-bind="api.getItemGroupProps({ id: group })">
          <div v-bind="api.getItemGroupLabelProps({ htmlFor: group })">{{ group }}</div>
          <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item, persistFocus: true })">
            <Highlight :text="item.label" :query="query" />
            <span v-if="query && pages.getAncestors(item).length > 0" data-part="item-path">
              {{
                pages
                  .getAncestors(item)
                  .map((page) => page.label)
                  .join(" › ")
              }}
            </span>
            <span v-if="pages.isPage(item)" data-part="item-indicator">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
