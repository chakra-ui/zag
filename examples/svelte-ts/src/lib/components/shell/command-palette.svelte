<script lang="ts" module>
  export type PaletteMode = { type: "all" } | { type: "components" } | { type: "examples"; component: string }
</script>

<script lang="ts">
  import { goto } from "$app/navigation"
  import Portal from "#lib/components/portal.svelte"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as combobox from "@zag-js/combobox"
  import type * as dialog from "@zag-js/dialog"
  import { createFilter } from "@zag-js/i18n-utils"
  import { componentRoutesData, exampleRoutes, getComponentExamples } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowDownIcon, ArrowUpIcon, CheckIcon, CornerDownLeftIcon, SearchIcon } from "lucide-svelte"
  import { untrack } from "svelte"

  interface PaletteItem {
    value: string
    label: string
    group: string
    meta?: string
  }

  type Row = { type: "group"; label: string } | { type: "item"; item: PaletteItem }

  const props: { api: dialog.Api; mode: PaletteMode; currentPath: string | null } = $props()

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

  // The palette remounts on every open, so mode and path are read once
  const mode = untrack(() => props.mode)
  const allItems = getItems(mode)
  const currentValue = getCurrentValue(
    allItems,
    untrack(() => props.currentPath),
  )

  let query = $state("")
  const items = $derived(allItems.filter((item) => matches(item, query)))
  const collection = $derived(combobox.collection({ items }))

  // Flatten groups into rows so the virtualizer can render headers and items alike
  const layout = $derived.by(() => {
    const rows: Row[] = []
    const itemRowIndex: number[] = []
    items.forEach((item, index) => {
      if (items[index - 1]?.group !== item.group) rows.push({ type: "group", label: item.group })
      itemRowIndex.push(rows.length)
      rows.push({ type: "item", item })
    })
    return { rows, itemRowIndex }
  })

  const rowSize = (index: number) => (layout.rows[index]?.type === "group" ? GROUP_HEIGHT : ITEM_HEIGHT)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: layout.rows.length,
    estimatedItemSize: rowSize,
    observeScrollElementSize: true,
    overscan: 8,
    // Group labels share the row index, so positions come from the options
    aria: false,
    // The list's vertical padding lives here so scrolled-to rows clear the edges
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
  }))

  const service = useMachine(combobox.machine, (): combobox.Props<PaletteItem> => ({
    id: "pg-palette",
    collection,
    inline: true,
    loopFocus: false,
    // Pickers open on the current item, like a native select
    defaultHighlightedValue: mode.type === "all" ? null : currentValue,
    scrollToIndexFn({ index, immediate }) {
      const { rows, itemRowIndex } = layout
      const rowIndex = itemRowIndex[index]
      if (rowIndex == null) return
      // Bring the group header along when jumping to a group's first item
      const target = immediate && rows[rowIndex - 1]?.type === "group" ? rowIndex - 1 : rowIndex
      vz.virtualizer.scrollToIndex(target, { align: immediate ? "center" : "auto" })
    },
    autoHighlight: true,
    selectionBehavior: "clear",
    onInputValueChange({ inputValue }) {
      query = inputValue
    },
    onValueChange({ value }) {
      const path = value[0]
      if (!path) return
      props.api.setOpen(false)
      goto(path)
    },
  }))

  const comboboxApi = $derived(combobox.connect(service, normalizeProps))
</script>

<Portal>
  <div {...props.api.getBackdropProps()} class="pg-overlay"></div>
  <div {...props.api.getPositionerProps()} class="pg-palette-positioner">
    <div {...props.api.getContentProps()} class="pg-palette pg-layer">
      <h2 {...props.api.getTitleProps()} class="pg-sr-only">{placeholders[mode.type]}</h2>

      <div {...comboboxApi.getRootProps()} class="pg-palette-root">
        <div {...comboboxApi.getControlProps()} class="pg-palette-control">
          <SearchIcon aria-hidden="true" />
          <input
            {...mergeProps(comboboxApi.getInputProps(), {
              placeholder: placeholders[mode.type],
              "aria-label": placeholders[mode.type],
            })}
            class="pg-palette-input"
          />
          <kbd class="pg-kbd">Esc</kbd>
        </div>

        <div {...comboboxApi.getContentProps()} class="pg-palette-content">
          <div {...comboboxApi.getEmptyProps()} class="pg-palette-empty">
            {#if collection.size === 0}No results for “{query}”{/if}
          </div>
          <div
            {...mergeProps(vz.virtualizer.getRootProps(), comboboxApi.getListProps())}
            {@attach vz.init}
            class="pg-palette-list"
          >
            <div {...vz.virtualizer.getContentProps()}>
              {#each vz.virtualizer.getVirtualItems() as virtualItem (virtualItem.index)}
                {@const row = layout.rows[virtualItem.index]}
                {#if row?.type === "group"}
                  <div {...vz.virtualizer.getItemProps(virtualItem)} role="presentation" class="pg-palette-group-label">
                    {row.label}
                  </div>
                {:else if row}
                  <div
                    {...mergeProps(
                      vz.virtualizer.getItemProps(virtualItem),
                      comboboxApi.getItemProps({ item: row.item, persistFocus: true }),
                    )}
                    class="pg-palette-item"
                  >
                    <span class="pg-palette-item-label">{row.item.label}</span>
                    {#if row.item.meta}
                      <span class="pg-palette-item-meta">{row.item.meta}</span>
                    {/if}
                    {#if row.item.value === currentValue}
                      <CheckIcon class="pg-palette-item-check" aria-hidden="true" />
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="pg-palette-footer" aria-hidden="true">
        <span>
          <kbd class="pg-kbd"><ArrowUpIcon size={11} /><ArrowDownIcon size={11} /></kbd>
          Navigate
        </span>
        <span>
          <kbd class="pg-kbd"><CornerDownLeftIcon size={11} /></kbd>
          Open
        </span>
        <span><kbd class="pg-kbd">Esc</kbd> Close</span>
      </div>
    </div>
  </div>
</Portal>
