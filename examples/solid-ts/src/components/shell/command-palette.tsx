import * as combobox from "@zag-js/combobox"
import type * as dialog from "@zag-js/dialog"
import { createFilter } from "@zag-js/i18n-utils"
import { componentRoutesData, exampleRoutes, getComponentExamples } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { useNavigate } from "@solidjs/router"
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, CornerDownLeftIcon, SearchIcon } from "lucide-solid"
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  Index,
  Match,
  Show,
  Switch,
  untrack,
  type Accessor,
} from "solid-js"
import { Portal } from "solid-js/web"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const { contains } = createFilter({ sensitivity: "base" })

export type PaletteMode = { type: "all" } | { type: "components" } | { type: "examples"; component: string }

interface PaletteItem {
  value: string
  label: string
  group: string
  meta?: string
}

const sortedExamples = [...exampleRoutes].sort((a, b) => a.componentLabel.localeCompare(b.componentLabel))

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

type ScrollToIndex = (itemIndex: number, immediate: boolean) => void

interface CommandPaletteProps {
  api: Accessor<dialog.Api>
  mode: PaletteMode
  currentPath: string | null
}

/** Rendered only while open, so its dialog and combobox never sit next to an example's own parts */
export function CommandPalette(props: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = createSignal("")

  const allItems = getItems(props.mode)
  const items = createMemo(() => allItems.filter((item) => matches(item, query())))
  const collection = createMemo(() => combobox.collection({ items: items() }))
  const currentValue = getCurrentValue(allItems, props.currentPath)
  // Filled in by the list once it mounts; the combobox scrolls through it
  let scrollToIndex: ScrollToIndex | undefined

  const id = createUniqueId()
  const service = useMachine(combobox.machine, (): combobox.Props<PaletteItem> => ({
    id,
    collection: collection(),
    inline: true,
    loopFocus: false,
    // Pickers open on the current item, like a native select
    defaultHighlightedValue: props.mode.type === "all" ? null : currentValue,
    scrollToIndexFn(details) {
      scrollToIndex?.(details.index, !!details.immediate)
    },
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
    onValueChange({ value }) {
      const path = value[0]
      if (!path) return
      props.api().setOpen(false)
      navigate(path)
    },
  }))

  const comboboxApi = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <Portal>
      <div {...props.api().getBackdropProps()} class="pg-overlay" />
      <div {...props.api().getPositionerProps()} class="pg-palette-positioner">
        <div {...props.api().getContentProps()} class="pg-palette pg-layer">
          <h2 {...props.api().getTitleProps()} class="pg-sr-only">
            {placeholders[props.mode.type]}
          </h2>

          <div {...comboboxApi().getRootProps()} class="pg-palette-root">
            <div {...comboboxApi().getControlProps()} class="pg-palette-control">
              <SearchIcon aria-hidden />
              <input
                {...mergeProps(comboboxApi().getInputProps(), {
                  placeholder: placeholders[props.mode.type],
                  "aria-label": placeholders[props.mode.type],
                })}
                class="pg-palette-input"
              />
              <kbd class="pg-kbd">Esc</kbd>
            </div>

            <div {...comboboxApi().getContentProps()} class="pg-palette-content">
              <div {...comboboxApi().getEmptyProps()} class="pg-palette-empty">
                {collection().size === 0 && `No results for “${query()}”`}
              </div>
              <PaletteList
                api={comboboxApi}
                items={items}
                currentValue={currentValue}
                setScrollToIndex={(fn) => (scrollToIndex = fn)}
              />
            </div>
          </div>

          <div class="pg-palette-footer" aria-hidden>
            <span>
              <kbd class="pg-kbd">
                <ArrowUpIcon size={11} />
                <ArrowDownIcon size={11} />
              </kbd>
              Navigate
            </span>
            <span>
              <kbd class="pg-kbd">
                <CornerDownLeftIcon size={11} />
              </kbd>
              Open
            </span>
            <span>
              <kbd class="pg-kbd">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </Portal>
  )
}

interface PaletteListProps {
  api: Accessor<combobox.Api>
  items: Accessor<PaletteItem[]>
  currentValue: string | null
  setScrollToIndex: (fn: ScrollToIndex) => void
}

/** Virtualized rows (group headers and items); mounts with the dialog content */
function PaletteList(props: PaletteListProps) {
  const data = createMemo(() => getRows(props.items()))
  const estimatedSize = (index: number) => (data().rows[index]?.type === "group" ? GROUP_HEIGHT : ITEM_HEIGHT)

  const { virtualizer, ref } = useListVirtualizer({
    count: data().rows.length,
    estimatedSize,
    observeScrollElementSize: true,
    overscan: 8,
    // The list's vertical padding lives here so scrolled-to rows clear the edges
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
  })

  // untrack: the proxy would subscribe this effect to the virtualizer it updates
  createEffect(() => {
    const { rows } = data()
    untrack(() => virtualizer.updateOptions({ count: rows.length, estimatedSize }))
  })

  props.setScrollToIndex((itemIndex, immediate) => {
    const { rows, itemRowIndex } = data()
    const rowIndex = itemRowIndex[itemIndex]
    if (rowIndex == null) return
    // Bring the group header along when jumping to a group's first item
    const target = immediate && rows[rowIndex - 1]?.type === "group" ? rowIndex - 1 : rowIndex
    virtualizer.scrollToIndex(target, { align: immediate ? "center" : "auto" })
  })

  return (
    <div {...props.api().getListProps()} ref={ref} onScroll={virtualizer.handleScroll} class="pg-palette-list">
      <div style={{ position: "relative", width: "100%", height: `${virtualizer.getTotalSize()}px` }}>
        {/* Index, not For: the virtualizer reuses its item objects */}
        <Index each={virtualizer.getVirtualItems()}>
          {(virtualItem) => {
            const row = () => data().rows[virtualItem().index]
            const style = () => virtualizer.getItemStyle(virtualItem())
            return (
              <Switch>
                <Match when={row()?.type === "group" && row()}>
                  {(group) => (
                    <div role="presentation" class="pg-palette-group-label" style={style()}>
                      {(group() as Extract<Row, { type: "group" }>).label}
                    </div>
                  )}
                </Match>
                <Match when={row()?.type === "item" && (row() as Extract<Row, { type: "item" }>).item}>
                  {(item) => (
                    <div
                      {...props.api().getItemProps({ item: item(), persistFocus: true })}
                      class="pg-palette-item"
                      style={style()}
                    >
                      <span class="pg-palette-item-label">{item().label}</span>
                      <Show when={item().meta}>
                        <span class="pg-palette-item-meta">{item().meta}</span>
                      </Show>
                      <Show when={item().value === props.currentValue}>
                        <CheckIcon class="pg-palette-item-check" aria-hidden />
                      </Show>
                    </div>
                  )}
                </Match>
              </Switch>
            )
          }}
        </Index>
      </div>
    </div>
  )
}
