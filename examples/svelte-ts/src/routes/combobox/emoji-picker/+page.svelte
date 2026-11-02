<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { type EmojiData, type EmojiDataCategory, EmojiLoader } from "#lib/emoji-loader.ts"
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import * as listbox from "@zag-js/listbox"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
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

  let data = $state.raw<EmojiData | null>(null)

  onMount(() => {
    loader.load().then(
      (value) => (data = value),
      (error) => console.error("Failed to load emojis", error),
    )
  })

  const emojis = $derived<EmojiItem[]>(
    (data?.emojis ?? []).map((emoji) => ({
      value: emoji.emoji,
      label: emoji.label,
      category: emoji.category,
      searchText: `${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase(),
    })),
  )
  const categories = $derived(data?.categories ?? [])

  let query = $state("")
  let selected = $state<string | null>(null)

  const normalizedQuery = $derived(query.trim().toLowerCase())
  const layout = $derived(
    getLayout(
      normalizedQuery ? emojis.filter((emoji) => emoji.searchText.includes(normalizedQuery)) : emojis,
      categories,
    ),
  )

  const collection = $derived(
    listbox.gridCollection({
      items: layout.items,
      columnCount: COLUMN_COUNT,
      isItemDisabled: (item) => !!item.placeholder,
    }),
  )

  // Stable reference; reads the latest layout
  const estimatedSize = (index: number) => (layout.rows[index]?.type === "header" ? HEADER_SIZE : CELL_SIZE)

  const { virtualizer, init } = useListVirtualizer(() => ({
    count: layout.rows.length,
    estimatedSize,
    groups: layout.groups,
    // Keep scrolled-to rows below the sticky header
    scrollPaddingStart: HEADER_SIZE,
    overscan: 4,
    paddingEnd: 4,
    observeScrollElementSize: true,
  }))

  const id = $props.id()
  const popoverService = useMachine(popover.machine, { id: `${id}-popover` })
  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))

  const listboxService = useMachine(listbox.machine as listbox.Machine<EmojiItem>, () => ({
    id: `${id}-listbox`,
    collection,
    // The item may not be rendered yet, so scroll its row into view
    scrollToIndexFn({ index }) {
      const row = layout.gridRowToRow[Math.floor(index / COLUMN_COUNT)]
      if (row != null) virtualizer.scrollToIndex(row, { align: "auto" })
    },
    onSelect({ value }) {
      selected = value
      popoverApi.setOpen(false)
    },
  }))

  const listboxApi = $derived(listbox.connect(listboxService, normalizeProps))
  const active = $derived(listboxApi.highlightedItem as EmojiItem | null)

  // Virtual rows are absolutely positioned, so the sticky header is an overlay
  const sticky = $derived(virtualizer.getStickyGroupHeader())
</script>

<main>
  <button {...popoverApi.getTriggerProps()} class="emoji-picker-trigger">
    <span>{selected ?? "😀"}</span> Pick emoji
  </button>

  <Portal>
    <div {...popoverApi.getPositionerProps()}>
      <div {...popoverApi.getContentProps()} class="emoji-picker">
        <div {...listboxApi.getRootProps()} class="emoji-picker-body">
          <input
            {...listboxApi.getInputProps({ autoHighlight: true, keyboardPriority: "navigate" })}
            class="emoji-search"
            placeholder="Search…"
            aria-label="Search emoji"
            value={query}
            oninput={(event) => (query = event.currentTarget.value)}
          />

          <!-- The input forwards arrow keys to the list; the content handles them -->
          <div {...listboxApi.getContentProps()} class="emoji-viewport">
            {#if sticky}
              <div
                class="emoji-category"
                data-sticky
                aria-hidden="true"
                style="transform: translateY({sticky.translateY}px)"
              >
                {sticky.group.id}
              </div>
            {/if}
            <div {...listboxApi.getListProps()} {@attach init} onscroll={virtualizer.handleScroll}>
              <div style="position: relative; height: {virtualizer.getTotalSize()}px">
                {#each virtualizer.getVirtualItems() as virtualRow (virtualRow.index)}
                  {@const row = layout.rows[virtualRow.index]}
                  {#if row}
                    {@const styleProps = normalizeProps.element({ style: virtualizer.getItemStyle(virtualRow) })}
                    {#if row.type === "header"}
                      <div class="emoji-category" {...styleProps}>
                        {row.label}
                      </div>
                    {:else}
                      <div class="emoji-row" {...styleProps}>
                        {#each layout.items.slice(row.start, row.start + COLUMN_COUNT) as item (item.value)}
                          {#if item.placeholder}
                            <div class="emoji-item" aria-hidden="true"></div>
                          {:else}
                            <div {...listboxApi.getItemProps({ item })} class="emoji-item">
                              <span {...listboxApi.getItemTextProps({ item })}>{item.value}</span>
                            </div>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  {/if}
                {/each}
              </div>
            </div>

            {#if emojis.length === 0}
              <p class="emoji-empty">Loading…</p>
            {/if}
            {#if emojis.length > 0 && layout.items.length === 0}
              <p class="emoji-empty">No emoji found</p>
            {/if}
          </div>
        </div>

        <div class="emoji-footer" aria-hidden="true">
          {#if active}
            <span class="emoji-footer-glyph">{active.value}</span>
            <span class="emoji-footer-label">{active.label}</span>
          {:else}
            <span class="emoji-footer-label">Select an emoji…</span>
          {/if}
        </div>
      </div>
    </div>
  </Portal>
</main>
