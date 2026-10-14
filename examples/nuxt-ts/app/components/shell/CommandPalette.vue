<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import type * as dialog from "@zag-js/dialog"
import { createFilter } from "@zag-js/i18n-utils"
import { componentRoutesData, exampleRoutes, getComponentExamples } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, CornerDownLeftIcon, SearchIcon } from "lucide-vue-next"

export type PaletteMode = { type: "all" } | { type: "components" } | { type: "examples"; component: string }

interface PaletteItem {
  value: string
  label: string
  group: string
  meta?: string
}

type Row = { type: "group"; label: string } | { type: "item"; item: PaletteItem }

const props = defineProps<{ api: dialog.Api; mode: PaletteMode; currentPath: string | null }>()

const { contains } = createFilter({ sensitivity: "base" })
const GROUP_HEIGHT = 30
const ITEM_HEIGHT = 36
const LIST_PADDING = 6

const sortedExamples = [...exampleRoutes].sort((a, b) => a.componentLabel.localeCompare(b.componentLabel))

function getItems(mode: PaletteMode): PaletteItem[] {
  if (mode.type === "components") {
    return componentRoutesData.map((item) => ({
      value: getComponentExamples(item.slug)[0]?.path ?? `/${item.slug}`,
      label: item.label,
      group: "Components",
      meta: `${getComponentExamples(item.slug).length}`,
    }))
  }
  if (mode.type === "examples") {
    return getComponentExamples(mode.component).map((route) => ({
      value: route.path,
      label: route.title,
      group: route.componentLabel,
    }))
  }
  return sortedExamples.map((route) => ({
    value: route.path,
    label: route.title,
    group: route.componentLabel,
    meta: route.path,
  }))
}

const matches = (item: PaletteItem, query: string) =>
  query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => contains(item.label, term) || contains(item.group, term))

function getCurrentValue(items: PaletteItem[], currentPath: string | null) {
  if (!currentPath) return null
  const exact = items.find((item) => item.value === currentPath)
  if (exact) return exact.value
  // The components list links each component to its first example
  const component = currentPath.split("/")[1]
  return items.find((item) => item.value.split("/")[1] === component)?.value ?? null
}

const placeholders: Record<PaletteMode["type"], string> = {
  all: "Search components and examples…",
  components: "Jump to a component…",
  examples: "Jump to an example…",
}

const router = useRouter()
const query = ref("")
const allItems = getItems(props.mode)
const currentValue = getCurrentValue(allItems, props.currentPath)
const items = computed(() => allItems.filter((item) => matches(item, query.value)))
const collection = computed(() => combobox.collection({ items: items.value }))

// Flatten groups into rows so the virtualizer can render headers and items alike
const layout = computed(() => {
  const rows: Row[] = []
  const itemRowIndex: number[] = []
  items.value.forEach((item, index) => {
    if (items.value[index - 1]?.group !== item.group) rows.push({ type: "group", label: item.group })
    itemRowIndex.push(rows.length)
    rows.push({ type: "item", item })
  })
  return { rows, itemRowIndex }
})

const rowSize = (index: number) => (layout.value.rows[index]?.type === "group" ? GROUP_HEIGHT : ITEM_HEIGHT)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: layout.value.rows.length,
  estimatedSize: (index: number) => rowSize(index),
  observeScrollElementSize: true,
  overscan: 8,
  // The list's vertical padding lives here so scrolled-to rows clear the edges
  paddingStart: LIST_PADDING,
  paddingEnd: LIST_PADDING,
}))

const id = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    id,
    collection: collection.value,
    open: true,
    disableLayer: true,
    loopFocus: false,
    // Pickers open on the current item, like a native select
    defaultHighlightedValue: props.mode.type === "all" ? null : currentValue,
    scrollToIndexFn({ index, immediate }) {
      const { rows, itemRowIndex } = layout.value
      const rowIndex = itemRowIndex[index]
      if (rowIndex == null) return
      // Bring the group header along when jumping to a group's first item
      const target = immediate && rows[rowIndex - 1]?.type === "group" ? rowIndex - 1 : rowIndex
      virtualizer.scrollToIndex(target, { align: immediate ? "center" : "auto" })
    },
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange({ inputValue }) {
      query.value = inputValue
    },
    onValueChange({ value }) {
      const path = value[0]
      if (!path) return
      props.api.setOpen(false)
      router.push(path)
    },
  })),
)

const comboboxApi = computed(() => combobox.connect(service, normalizeProps))
const inputProps = computed(() =>
  mergeProps(comboboxApi.value.getInputProps(), {
    placeholder: placeholders[props.mode.type],
    "aria-label": placeholders[props.mode.type],
  }),
)
const listRef = (el: any) => init(el as HTMLElement | null)
</script>

<template>
  <Teleport to="#teleports">
    <div v-bind="api.getBackdropProps()" class="pg-overlay" />
    <div v-bind="api.getPositionerProps()" class="pg-palette-positioner">
      <div v-bind="api.getContentProps()" class="pg-palette pg-layer">
        <h2 v-bind="api.getTitleProps()" class="pg-sr-only">{{ placeholders[mode.type] }}</h2>

        <div v-bind="comboboxApi.getRootProps()" class="pg-palette-root">
          <div v-bind="comboboxApi.getControlProps()" class="pg-palette-control">
            <SearchIcon aria-hidden="true" />
            <input v-bind="inputProps" class="pg-palette-input" />
            <kbd class="pg-kbd">Esc</kbd>
          </div>

          <div v-bind="comboboxApi.getContentProps()" class="pg-palette-content">
            <div v-bind="comboboxApi.getEmptyProps()" class="pg-palette-empty">
              <template v-if="collection.size === 0">No results for “{{ query }}”</template>
            </div>
            <div
              v-bind="comboboxApi.getListProps()"
              :ref="listRef"
              class="pg-palette-list"
              @scroll="virtualizer.handleScroll"
            >
              <div :style="{ position: 'relative', width: '100%', height: `${virtualizer.getTotalSize()}px` }">
                <template v-for="virtualItem in virtualizer.getVirtualItems()" :key="virtualItem.index">
                  <div
                    v-if="layout.rows[virtualItem.index]?.type === 'group'"
                    role="presentation"
                    class="pg-palette-group-label"
                    :style="virtualizer.getItemStyle(virtualItem)"
                  >
                    {{ (layout.rows[virtualItem.index] as { label: string }).label }}
                  </div>
                  <div
                    v-else-if="layout.rows[virtualItem.index]"
                    v-bind="
                      comboboxApi.getItemProps({
                        item: (layout.rows[virtualItem.index] as { item: PaletteItem }).item,
                        persistFocus: true,
                      })
                    "
                    class="pg-palette-item"
                    :style="virtualizer.getItemStyle(virtualItem)"
                  >
                    <span class="pg-palette-item-label">
                      {{ (layout.rows[virtualItem.index] as { item: PaletteItem }).item.label }}
                    </span>
                    <span
                      v-if="(layout.rows[virtualItem.index] as { item: PaletteItem }).item.meta"
                      class="pg-palette-item-meta"
                    >
                      {{ (layout.rows[virtualItem.index] as { item: PaletteItem }).item.meta }}
                    </span>
                    <CheckIcon
                      v-if="(layout.rows[virtualItem.index] as { item: PaletteItem }).item.value === currentValue"
                      class="pg-palette-item-check"
                      aria-hidden="true"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="pg-palette-footer" aria-hidden="true">
          <span>
            <kbd class="pg-kbd"><ArrowUpIcon :size="11" /><ArrowDownIcon :size="11" /></kbd>
            Navigate
          </span>
          <span>
            <kbd class="pg-kbd"><CornerDownLeftIcon :size="11" /></kbd>
            Open
          </span>
          <span><kbd class="pg-kbd">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
