"use client"

import * as listbox from "@zag-js/listbox"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import { type EmojiData, type EmojiDataCategory, EmojiLoader } from "@/lib/emoji-loader"
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

function useEmojis() {
  const [data, setData] = useState<EmojiData | null>(null)
  useEffect(() => {
    loader.load().then(setData, (error) => console.error("Failed to load emojis", error))
  }, [])

  const emojis = useMemo<EmojiItem[]>(
    () =>
      (data?.emojis ?? []).map((emoji) => ({
        value: emoji.emoji,
        label: emoji.label,
        category: emoji.category,
        searchText: `${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase(),
      })),
    [data],
  )

  const categories = useMemo(() => data?.categories ?? [], [data])
  return { emojis, categories }
}

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
  const { emojis, categories } = useEmojis()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const { items, rows, gridRowToRow, groups } = useMemo(
    () =>
      getLayout(
        deferredQuery ? emojis.filter((emoji) => emoji.searchText.includes(deferredQuery)) : emojis,
        categories,
      ),
    [emojis, categories, deferredQuery],
  )

  const collection = useMemo(
    () =>
      listbox.gridCollection({
        items,
        columnCount: COLUMN_COUNT,
        isItemDisabled: (item) => !!item.placeholder,
      }),
    [items],
  )

  const { virtualizer, ref: scrollRef } = useListVirtualizer({
    count: rows.length,
    estimatedSize: (index) => (rows[index]?.type === "header" ? HEADER_SIZE : CELL_SIZE),
    groups,
    // Keep scrolled-to rows below the sticky header
    scrollPaddingStart: HEADER_SIZE,
    overscan: 4,
    paddingEnd: 4,
    observeScrollElementSize: true,
  })

  const popoverService = useMachine(popover.machine, { id: useId() })
  const popoverApi = popover.connect(popoverService, normalizeProps)

  const listboxService = useMachine(listbox.machine, {
    id: useId(),
    collection,
    // The item may not be rendered yet, so scroll its row into view
    scrollToIndexFn({ index }) {
      const row = gridRowToRow[Math.floor(index / COLUMN_COUNT)]
      if (row != null) virtualizer.scrollToIndex(row, { align: "auto" })
    },
    onSelect({ value }) {
      setSelected(value)
      popoverApi.setOpen(false)
    },
  })

  const listboxApi = listbox.connect(listboxService, normalizeProps)
  const active = listboxApi.highlightedItem as EmojiItem | null

  // Virtual rows are absolutely positioned, so the sticky header is an overlay
  const sticky = virtualizer.getStickyGroupHeader()

  return (
    <main>
      <button {...popoverApi.getTriggerProps()} className="emoji-picker-trigger">
        <span>{selected ?? "😀"}</span> Pick emoji
      </button>

      <Portal>
        <div {...popoverApi.getPositionerProps()}>
          <div {...popoverApi.getContentProps()} className="emoji-picker">
            <div {...listboxApi.getRootProps()} className="emoji-picker-body">
              <input
                {...listboxApi.getInputProps({ autoHighlight: true, keyboardPriority: "navigate" })}
                className="emoji-search"
                placeholder="Search…"
                aria-label="Search emoji"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
              />

              {/* The input forwards arrow keys to the list; the content handles them */}
              <div {...listboxApi.getContentProps()} className="emoji-viewport">
                {sticky && (
                  <div
                    className="emoji-category"
                    data-sticky
                    aria-hidden
                    style={{ transform: `translateY(${sticky.translateY}px)` }}
                  >
                    {sticky.group.id}
                  </div>
                )}
                <div {...listboxApi.getListProps()} ref={scrollRef} onScroll={virtualizer.handleScroll}>
                  <div style={{ position: "relative", height: virtualizer.getTotalSize() }}>
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index]
                      if (!row) return null
                      const style = virtualizer.getItemStyle(virtualRow)
                      if (row.type === "header") {
                        return (
                          <div key={`header:${row.label}`} className="emoji-category" style={style}>
                            {row.label}
                          </div>
                        )
                      }
                      return (
                        <div key={row.start} className="emoji-row" style={style}>
                          {items.slice(row.start, row.start + COLUMN_COUNT).map((item) =>
                            item.placeholder ? (
                              <div key={item.value} className="emoji-item" aria-hidden />
                            ) : (
                              <div key={item.value} {...listboxApi.getItemProps({ item })} className="emoji-item">
                                <span {...listboxApi.getItemTextProps({ item })}>{item.value}</span>
                              </div>
                            ),
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {emojis.length === 0 && <p className="emoji-empty">Loading…</p>}
                {emojis.length > 0 && items.length === 0 && <p className="emoji-empty">No emoji found</p>}
              </div>
            </div>

            <div className="emoji-footer" aria-hidden>
              {active ? (
                <>
                  <span className="emoji-footer-glyph">{active.value}</span>
                  <span className="emoji-footer-label">{active.label}</span>
                </>
              ) : (
                <span className="emoji-footer-label">Select an emoji…</span>
              )}
            </div>
          </div>
        </div>
      </Portal>
    </main>
  )
}
