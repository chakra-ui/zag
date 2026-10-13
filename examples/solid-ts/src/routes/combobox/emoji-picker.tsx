import * as listbox from "@zag-js/listbox"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Index, onMount, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import { type EmojiData, type EmojiDataCategory, EmojiLoader } from "~/lib/emoji-loader"
import "@styles/emoji-picker.css"

interface EmojiItem {
  value: string
  label: string
  category: number
  searchText: string
  /** Fills a category's last row so every category starts on a new row */
  placeholder?: boolean
}

type Row = { type: "header"; label: string } | { type: "emojis"; start: number }

const COLUMN_COUNT = 8
const CELL_SIZE = 40
const HEADER_SIZE = 32

const loader = new EmojiLoader({ locale: "en" })

// Group by category: a header row, then emoji rows padded to full width
function getLayout(emojis: EmojiItem[], categories: EmojiDataCategory[]) {
  const items: EmojiItem[] = []
  const rows: Row[] = []
  // Grid row (in the collection) → visual row (with headers)
  const gridRowToRow: number[] = []
  // Sticky headers, one per category
  const groups: { id: string; startIndex: number; headerSize: number }[] = []

  categories.forEach(({ index: category, label }) => {
    const group = emojis.filter((emoji) => emoji.category === category)
    if (!group.length) return
    groups.push({ id: label, startIndex: rows.length, headerSize: HEADER_SIZE })
    rows.push({ type: "header", label })
    const padding = (COLUMN_COUNT - (group.length % COLUMN_COUNT)) % COLUMN_COUNT
    for (let i = 0; i < padding; i++) {
      group.push({ value: `placeholder:${category}:${i}`, label: "", category, searchText: "", placeholder: true })
    }
    for (let start = 0; start < group.length; start += COLUMN_COUNT) {
      gridRowToRow.push(rows.length)
      rows.push({ type: "emojis", start: items.length + start })
    }
    items.push(...group)
  })

  return { items, rows, gridRowToRow, groups }
}

export default function Page() {
  const [data, setData] = createSignal<EmojiData | null>(null)
  const [query, setQuery] = createSignal("")
  const [selected, setSelected] = createSignal<string | null>(null)

  onMount(() => {
    loader.load().then(setData, (error) => console.error("Failed to load emojis", error))
  })

  const emojis = createMemo<EmojiItem[]>(() =>
    (data()?.emojis ?? []).map((emoji) => ({
      value: emoji.emoji,
      label: emoji.label,
      category: emoji.category,
      searchText: `${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase(),
    })),
  )

  const layout = createMemo(() => {
    const search = query().trim().toLowerCase()
    const list = search ? emojis().filter((emoji) => emoji.searchText.includes(search)) : emojis()
    return getLayout(list, data()?.categories ?? [])
  })

  const collection = createMemo(() =>
    listbox.gridCollection({
      items: layout().items,
      columnCount: COLUMN_COUNT,
      isItemDisabled: (item) => !!item.placeholder,
    }),
  )

  const { virtualizer, ref: scrollRef } = useListVirtualizer(() => ({
    count: layout().rows.length,
    estimatedSize: (index) => (layout().rows[index]?.type === "header" ? HEADER_SIZE : CELL_SIZE),
    groups: layout().groups,
    // Keep scrolled-to rows below the sticky header
    scrollPaddingStart: HEADER_SIZE,
    overscan: 4,
    paddingEnd: 4,
    observeScrollElementSize: true,
  }))

  const popoverService = useMachine(popover.machine, { id: createUniqueId() })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  const listboxId = createUniqueId()
  const listboxService = useMachine(listbox.machine, () => ({
    id: listboxId,
    collection: collection(),
    // The item may not be rendered yet, so scroll its row into view
    scrollToIndexFn({ index }) {
      const row = layout().gridRowToRow[Math.floor(index / COLUMN_COUNT)]
      if (row != null) virtualizer.scrollToIndex(row, { align: "auto" })
    },
    onSelect({ value }) {
      setSelected(value)
      popoverApi().setOpen(false)
    },
  }))

  const api = createMemo(() => listbox.connect(listboxService, normalizeProps))
  const active = () => api().highlightedItem as EmojiItem | null

  // Virtual rows are absolutely positioned, so the sticky header is an overlay
  const sticky = () => virtualizer.getStickyGroupHeader()

  return (
    <main>
      <button {...popoverApi().getTriggerProps()} class="emoji-picker-trigger">
        <span>{selected() ?? "😀"}</span> Pick emoji
      </button>

      <Portal>
        <div {...popoverApi().getPositionerProps()}>
          <div {...popoverApi().getContentProps()} class="emoji-picker">
            <div {...api().getRootProps()} class="emoji-picker-body">
              <input
                {...api().getInputProps({ autoHighlight: true, keyboardPriority: "navigate" })}
                class="emoji-search"
                placeholder="Search…"
                aria-label="Search emoji"
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
              />

              {/* The input forwards arrow keys to the list; the content handles them */}
              <div {...api().getContentProps()} class="emoji-viewport">
                <Show when={sticky()}>
                  {(header) => (
                    <div
                      class="emoji-category"
                      data-sticky
                      aria-hidden
                      style={{ transform: `translateY(${header().translateY}px)` }}
                    >
                      {header().group.id}
                    </div>
                  )}
                </Show>

                <div {...api().getListProps()} ref={scrollRef} onScroll={virtualizer.handleScroll}>
                  <div style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
                    {/* Index, not For: the virtualizer reuses its item objects */}
                    <Index each={virtualizer.getVirtualItems()}>
                      {(virtualRow) => {
                        const row = () => layout().rows[virtualRow().index]
                        const style = () => virtualizer.getItemStyle(virtualRow())
                        return (
                          <Show
                            when={row()?.type === "emojis"}
                            fallback={
                              <div class="emoji-category" style={style()}>
                                {(row() as Extract<Row, { type: "header" }> | undefined)?.label}
                              </div>
                            }
                          >
                            <div class="emoji-row" style={style()}>
                              <Index
                                each={layout().items.slice(
                                  (row() as Extract<Row, { type: "emojis" }>).start,
                                  (row() as Extract<Row, { type: "emojis" }>).start + COLUMN_COUNT,
                                )}
                              >
                                {(item) => (
                                  <Show when={!item().placeholder} fallback={<div class="emoji-item" aria-hidden />}>
                                    <div {...api().getItemProps({ item: item() })} class="emoji-item">
                                      <span {...api().getItemTextProps({ item: item() })}>{item().value}</span>
                                    </div>
                                  </Show>
                                )}
                              </Index>
                            </div>
                          </Show>
                        )
                      }}
                    </Index>
                  </div>
                </div>

                <Show when={emojis().length === 0}>
                  <p class="emoji-empty">Loading…</p>
                </Show>
                <Show when={emojis().length > 0 && layout().items.length === 0}>
                  <p class="emoji-empty">No emoji found</p>
                </Show>
              </div>
            </div>

            <div class="emoji-footer" aria-hidden>
              <Show when={active()} fallback={<span class="emoji-footer-label">Select an emoji…</span>}>
                {(item) => (
                  <>
                    <span class="emoji-footer-glyph">{item().value}</span>
                    <span class="emoji-footer-label">{item().label}</span>
                  </>
                )}
              </Show>
            </div>
          </div>
        </div>
      </Portal>
    </main>
  )
}
