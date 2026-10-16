"use client"

import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { componentRoutesData, exampleRoutes, getComponentExamples } from "@zag-js/shared"
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, CornerDownLeftIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useId, useMemo, useRef, useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"

const { contains } = createFilter({ sensitivity: "base" })

export type PaletteMode = { type: "all" } | { type: "components" } | { type: "examples"; component: string }

interface PaletteItem {
  value: string
  label: string
  group: string
  meta?: string
}

function getItems(mode: PaletteMode): PaletteItem[] {
  switch (mode.type) {
    case "components":
      return componentRoutesData.map((item) => ({
        value: getComponentExamples(item.slug)[0]?.path ?? `/${item.slug}`,
        label: item.label,
        group: "Components",
        meta: `${getComponentExamples(item.slug).length}`,
      }))
    case "examples":
      return getComponentExamples(mode.component).map((route) => ({
        value: route.path,
        label: route.title,
        group: route.componentLabel,
      }))
    default:
      return sortedExamples.map((route) => ({
        value: route.path,
        label: route.title,
        group: route.componentLabel,
        meta: route.path,
      }))
  }
}

const sortedExamples = [...exampleRoutes].sort((a, b) => a.componentLabel.localeCompare(b.componentLabel))

function matches(item: PaletteItem, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean)
  return terms.every((term) => contains(item.label, term) || contains(item.group, term))
}

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

type Row = { type: "group"; label: string } | { type: "item"; item: PaletteItem }

const GROUP_HEIGHT = 30
const ITEM_HEIGHT = 36
const LIST_PADDING = 6

// Flatten groups into rows so the virtualizer can render headers and items alike
function getRows(items: PaletteItem[]) {
  const rows: Row[] = []
  const itemRowIndex: number[] = []
  items.forEach((item, index) => {
    if (index === 0 || items[index - 1].group !== item.group) rows.push({ type: "group", label: item.group })
    itemRowIndex.push(rows.length)
    rows.push({ type: "item", item })
  })
  return { rows, itemRowIndex }
}

interface CommandPaletteProps {
  api: dialog.Api
  mode: PaletteMode
  currentPath: string | null
}

/** Rendered only while open, so its dialog and combobox never sit next to an example's own parts */
export function CommandPalette(props: CommandPaletteProps) {
  const { api, mode, currentPath } = props
  const router = useRouter()
  const [query, setQuery] = useState("")

  const allItems = useMemo(() => getItems(mode), [mode])
  const items = useMemo(() => allItems.filter((item) => matches(item, query)), [allItems, query])
  const collection = useMemo(() => combobox.collection({ items }), [items])
  const currentValue = getCurrentValue(allItems, currentPath)
  // Filled in by the list once it mounts; the combobox scrolls through it
  const scrollToIndexRef = useRef<ScrollToIndex | null>(null)

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    inline: true,
    loopFocus: false,
    // Pickers open on the current item, like a native select
    defaultHighlightedValue: mode.type === "all" ? null : currentValue,
    scrollToIndexFn(details) {
      scrollToIndexRef.current?.(details.index, !!details.immediate)
    },
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
    onValueChange({ value }) {
      const path = value[0]
      if (!path) return
      api.setOpen(false)
      router.push(path)
    },
  })

  const comboboxApi = combobox.connect(service, normalizeProps)

  return (
    <Portal>
      <div {...api.getBackdropProps()} className="pg-overlay" />
      <div {...api.getPositionerProps()} className="pg-palette-positioner">
        <div {...api.getContentProps()} className="pg-palette pg-layer">
          <h2 {...api.getTitleProps()} className="pg-sr-only">
            {placeholders[mode.type]}
          </h2>

          <div {...comboboxApi.getRootProps()} className="pg-palette-root">
            <div {...comboboxApi.getControlProps()} className="pg-palette-control">
              <SearchIcon aria-hidden />
              <input
                {...mergeProps(comboboxApi.getInputProps(), {
                  placeholder: placeholders[mode.type],
                  "aria-label": placeholders[mode.type],
                })}
                className="pg-palette-input"
              />
              <kbd className="pg-kbd">Esc</kbd>
            </div>

            <div {...comboboxApi.getContentProps()} className="pg-palette-content">
              <div {...comboboxApi.getEmptyProps()} className="pg-palette-empty">
                {collection.size === 0 && `No results for “${query}”`}
              </div>
              <PaletteList
                api={comboboxApi}
                items={items}
                currentValue={currentValue}
                scrollToIndexRef={scrollToIndexRef}
              />
            </div>
          </div>

          <div className="pg-palette-footer" aria-hidden>
            <span>
              <kbd className="pg-kbd">
                <ArrowUpIcon size={11} />
                <ArrowDownIcon size={11} />
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="pg-kbd">
                <CornerDownLeftIcon size={11} />
              </kbd>
              Open
            </span>
            <span>
              <kbd className="pg-kbd">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </Portal>
  )
}

type ScrollToIndex = (itemIndex: number, immediate: boolean) => void

interface PaletteListProps {
  api: combobox.Api
  items: PaletteItem[]
  currentValue: string | null
  scrollToIndexRef: React.RefObject<ScrollToIndex | null>
}

/** Virtualized rows (group headers and items); mounts with the dialog content */
function PaletteList(props: PaletteListProps) {
  const { api, items, currentValue, scrollToIndexRef } = props
  const { rows, itemRowIndex } = useMemo(() => getRows(items), [items])
  const estimatedSize = useCallback(
    (index: number) => (rows[index]?.type === "group" ? GROUP_HEIGHT : ITEM_HEIGHT),
    [rows],
  )

  const { virtualizer, ref } = useListVirtualizer({
    count: rows.length,
    estimatedSize,
    observeScrollElementSize: true,
    overscan: 8,
    // The list's vertical padding lives here so scrolled-to rows clear the edges
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
  })

  scrollToIndexRef.current = (itemIndex, immediate) => {
    const rowIndex = itemRowIndex[itemIndex]
    if (rowIndex == null) return
    // Bring the group header along when jumping to a group's first item
    const target = immediate && rows[rowIndex - 1]?.type === "group" ? rowIndex - 1 : rowIndex
    virtualizer.scrollToIndex(target, { align: immediate ? "center" : "auto" })
  }

  return (
    <div {...api.getListProps()} ref={ref} onScroll={virtualizer.handleScroll} className="pg-palette-list">
      <div style={{ position: "relative", width: "100%", height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = rows[virtualItem.index]
          if (!row) return null
          const style = virtualizer.getItemStyle(virtualItem)
          if (row.type === "group") {
            return (
              <div key={`group:${row.label}`} role="presentation" className="pg-palette-group-label" style={style}>
                {row.label}
              </div>
            )
          }
          const { item } = row
          return (
            <div
              key={item.value}
              {...api.getItemProps({ item, persistFocus: true })}
              className="pg-palette-item"
              style={style}
            >
              <span className="pg-palette-item-label">{item.label}</span>
              {item.meta && <span className="pg-palette-item-meta">{item.meta}</span>}
              {item.value === currentValue && <CheckIcon className="pg-palette-item-check" aria-hidden />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
