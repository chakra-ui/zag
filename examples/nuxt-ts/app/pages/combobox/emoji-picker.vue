<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useListVirtualizer } from "~/composables/useVirtualizer"
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

const data = ref<EmojiData | null>(null)
onMounted(() => {
  loader.load().then(
    (value) => {
      data.value = value
    },
    (error) => console.error("Failed to load emojis", error),
  )
})

const emojis = computed<EmojiItem[]>(() =>
  (data.value?.emojis ?? []).map((emoji) => ({
    value: emoji.emoji,
    label: emoji.label,
    category: emoji.category,
    searchText: `${emoji.label} ${emoji.tags.join(" ")}`.toLowerCase(),
  })),
)

const categories = computed(() => data.value?.categories ?? [])

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

const query = ref("")
const selected = ref<string | null>(null)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const layout = computed(() =>
  getLayout(
    normalizedQuery.value
      ? emojis.value.filter((emoji) => emoji.searchText.includes(normalizedQuery.value))
      : emojis.value,
    categories.value,
  ),
)

const collection = computed(() =>
  listbox.gridCollection({
    items: layout.value.items,
    columnCount: COLUMN_COUNT,
    isItemDisabled: (item) => !!item.placeholder,
  }),
)

const { virtualizer, init } = useListVirtualizer(() => {
  const rows = layout.value.rows
  return {
    count: rows.length,
    estimatedSize: (index: number) => (rows[index]?.type === "header" ? HEADER_SIZE : CELL_SIZE),
    groups: layout.value.groups,
    // Keep scrolled-to rows below the sticky header
    scrollPaddingStart: HEADER_SIZE,
    overscan: 4,
    paddingEnd: 4,
    observeScrollElementSize: true,
  }
})

const popoverService = useMachine(popover.machine, { id: useId() })
const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))

const listboxId = useId()
const listboxService = useMachine(
  listbox.machine as listbox.Machine<EmojiItem>,
  computed(() => ({
    id: listboxId,
    collection: collection.value,
    // The item may not be rendered yet, so scroll its row into view
    scrollToIndexFn({ index }: { index: number }) {
      const row = layout.value.gridRowToRow[Math.floor(index / COLUMN_COUNT)]
      if (row != null) virtualizer.scrollToIndex(row, { align: "auto" })
    },
    onSelect({ value }: listbox.SelectionDetails) {
      selected.value = value
      popoverApi.value.setOpen(false)
    },
  })),
)

const listboxApi = computed(() => listbox.connect(listboxService, normalizeProps))
const active = computed(() => listboxApi.value.highlightedItem as EmojiItem | null)

// Virtual rows are absolutely positioned, so the sticky header is an overlay
const sticky = computed(() => virtualizer.getStickyGroupHeader())

const rowItems = (start: number) => layout.value.items.slice(start, start + COLUMN_COUNT)
</script>

<template>
  <main>
    <button v-bind="popoverApi.getTriggerProps()" class="emoji-picker-trigger">
      <span>{{ selected ?? "😀" }}</span> Pick emoji
    </button>

    <Teleport to="#teleports">
      <div v-bind="popoverApi.getPositionerProps()">
        <div v-bind="popoverApi.getContentProps()" class="emoji-picker">
          <div v-bind="listboxApi.getRootProps()" class="emoji-picker-body">
            <input
              v-bind="listboxApi.getInputProps({ autoHighlight: true, keyboardPriority: 'navigate' })"
              class="emoji-search"
              placeholder="Search…"
              aria-label="Search emoji"
              :value="query"
              @input="query = ($event.currentTarget as HTMLInputElement).value"
            />

            <!-- The input forwards arrow keys to the list; the content handles them -->
            <div v-bind="listboxApi.getContentProps()" class="emoji-viewport">
              <div
                v-if="sticky"
                class="emoji-category"
                data-sticky
                aria-hidden="true"
                :style="{ transform: `translateY(${sticky.translateY}px)` }"
              >
                {{ sticky.group.id }}
              </div>
              <div
                v-bind="listboxApi.getListProps()"
                :ref="(el) => init(el as HTMLElement)"
                @scroll="virtualizer.handleScroll"
              >
                <div :style="{ position: 'relative', height: `${virtualizer.getTotalSize()}px` }">
                  <template v-for="virtualRow in virtualizer.getVirtualItems()" :key="virtualRow.index">
                    <template v-if="layout.rows[virtualRow.index]">
                      <div
                        v-if="layout.rows[virtualRow.index]!.type === 'header'"
                        class="emoji-category"
                        :style="virtualizer.getItemStyle(virtualRow)"
                      >
                        {{ (layout.rows[virtualRow.index] as { label: string }).label }}
                      </div>
                      <div v-else class="emoji-row" :style="virtualizer.getItemStyle(virtualRow)">
                        <template
                          v-for="item in rowItems((layout.rows[virtualRow.index] as { start: number }).start)"
                          :key="item.value"
                        >
                          <div v-if="item.placeholder" class="emoji-item" aria-hidden="true" />
                          <div v-else v-bind="listboxApi.getItemProps({ item })" class="emoji-item">
                            <span v-bind="listboxApi.getItemTextProps({ item })">{{ item.value }}</span>
                          </div>
                        </template>
                      </div>
                    </template>
                  </template>
                </div>
              </div>

              <p v-if="emojis.length === 0" class="emoji-empty">Loading…</p>
              <p v-if="emojis.length > 0 && layout.items.length === 0" class="emoji-empty">No emoji found</p>
            </div>
          </div>

          <div class="emoji-footer" aria-hidden="true">
            <template v-if="active">
              <span class="emoji-footer-glyph">{{ active.value }}</span>
              <span class="emoji-footer-label">{{ active.label }}</span>
            </template>
            <span v-else class="emoji-footer-label">Select an emoji…</span>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
