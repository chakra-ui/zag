import * as listbox from "@zag-js/listbox"
import * as popover from "@zag-js/popover"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import {
  For,
  Index,
  Show,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js"
import { Portal } from "solid-js/web"
import { useGridVirtualizer } from "~/hooks/use-virtualizer"
import { EmojiLoader, validateSkinTone, type EmojiData, type SkinTone } from "~/lib/emoji-loader"
import "@styles/combobox.css"
import "@styles/listbox.css"
import "@styles/popover.css"

interface EmojiItem {
  label: string
  value: string
  emoji: string
  category: number
  tags: string[]
  skins?: Record<Exclude<SkinTone, "none">, string>
}

const EMOJI_CATEGORIES = [
  { id: 0, label: "Smileys & Emotion", icon: "😀" },
  { id: 1, label: "People & Body", icon: "👋" },
  { id: 2, label: "Animals & Nature", icon: "🐱" },
  { id: 3, label: "Food & Drink", icon: "🍎" },
  { id: 4, label: "Travel & Places", icon: "🚗" },
  { id: 5, label: "Activities", icon: "⚽" },
  { id: 6, label: "Objects", icon: "📱" },
  { id: 7, label: "Symbols", icon: "❤️" },
  { id: 8, label: "Flags", icon: "🏳️" },
]

const getSkinToneEmoji = (skinTone: SkinTone): string => {
  const skinToneEmojis = {
    none: "🖐️",
    light: "🖐🏻",
    "medium-light": "🖐🏼",
    medium: "🖐🏽",
    "medium-dark": "🖐🏾",
    dark: "🖐🏿",
  }
  return skinToneEmojis[skinTone]
}

interface SearchIndex {
  emoji: EmojiItem
  searchText: string
}

function useEmojiPicker() {
  const [emojiData, setEmojiData] = createSignal<EmojiData | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [searchQuery, setSearchQuery] = createSignal("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = createSignal("")
  const [selectedCategory, setSelectedCategory] = createSignal<number | null>(null)
  const [selectedSkinTone, setSelectedSkinTone] = createSignal<SkinTone>("none")
  const [selectedEmoji, setSelectedEmoji] = createSignal<string | null>(null)
  let searchIndex: SearchIndex[] = []

  const emojiLoader = new EmojiLoader({ locale: "en" })

  onMount(async () => {
    setLoading(true)
    try {
      setEmojiData(await emojiLoader.load())
    } catch (error) {
      console.error("Failed to load emoji data:", error)
    } finally {
      setLoading(false)
    }
  })

  // Debounce search query
  createEffect(
    on(searchQuery, (query) => {
      const timer = setTimeout(() => setDebouncedSearchQuery(query), 150)
      onCleanup(() => clearTimeout(timer))
    }),
  )

  // Build search index when emoji data changes
  const processedEmojis = createMemo(() => {
    const data = emojiData()
    if (!data) return []

    const skinTone = selectedSkinTone()
    const emojis: EmojiItem[] = []
    const index: SearchIndex[] = []

    for (const emoji of data.emojis) {
      let displayEmoji = emoji.emoji
      if (skinTone !== "none" && emoji.skins && skinTone in emoji.skins) {
        displayEmoji = emoji.skins[skinTone as Exclude<SkinTone, "none">]
      }

      const emojiItem: EmojiItem = {
        label: emoji.label,
        value: displayEmoji,
        emoji: displayEmoji,
        category: emoji.category,
        tags: emoji.tags,
        skins: emoji.skins,
      }

      const searchText = `${emoji.label.toLowerCase()} ${emoji.tags.join(" ").toLowerCase()}`

      emojis.push(emojiItem)
      index.push({ emoji: emojiItem, searchText })
    }

    searchIndex = index
    return emojis
  })

  const filteredEmojis = createMemo(() => {
    const processed = processedEmojis()
    if (!processed.length) return []

    const category = selectedCategory()
    const debounced = debouncedSearchQuery()
    let emojis = processed

    if (category !== null) {
      emojis = emojis.filter((emoji) => emoji.category === category)
    }

    if (debounced.trim()) {
      const query = debounced.toLowerCase()
      const relevantEntries =
        category !== null ? searchIndex.filter((entry) => entry.emoji.category === category) : searchIndex

      const searchResults = new Set<EmojiItem>()
      for (let i = 0; i < relevantEntries.length; i++) {
        const entry = relevantEntries[i]
        if (entry.searchText.includes(query)) {
          searchResults.add(entry.emoji)
        }
      }

      return Array.from(searchResults)
    }

    return emojis
  })

  const selectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory() ? null : categoryId)
  }

  const cycleCategory = (direction: "next" | "previous") => {
    const current = selectedCategory()
    const currentIndex = current === null ? -1 : EMOJI_CATEGORIES.findIndex((cat) => cat.id === current)
    if (direction === "next") {
      const nextIndex = currentIndex + 1
      selectCategory(EMOJI_CATEGORIES[nextIndex < EMOJI_CATEGORIES.length ? nextIndex : 0].id)
    } else {
      const nextIndex = currentIndex - 1
      selectCategory(EMOJI_CATEGORIES[nextIndex >= 0 ? nextIndex : EMOJI_CATEGORIES.length - 1].id)
    }
  }

  const isSearching = () => searchQuery() !== debouncedSearchQuery()

  return {
    emojiData,
    loading,
    searchQuery,
    selectedCategory,
    selectedSkinTone,
    selectedEmoji,
    filteredEmojis,
    isSearching,
    setSearchQuery,
    setSelectedEmoji,
    selectCategory,
    setSelectedSkinTone,
    getSkinToneEmoji,
    cycleCategory,
  }
}

export type EmojiPickerApi = ReturnType<typeof useEmojiPicker>

function EmojiPopover(props: { selectedEmoji: string | null; children: JSX.Element }) {
  const popoverService = useMachine(popover.machine, { id: createUniqueId() })
  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))

  onMount(() => {
    const onEmojiSelect = () => popoverApi().setOpen(false)
    document.addEventListener("emoji:select", onEmojiSelect)
    onCleanup(() => document.removeEventListener("emoji:select", onEmojiSelect))
  })

  return (
    <>
      <button {...popoverApi().getTriggerProps()} class="emoji-picker-trigger">
        {props.selectedEmoji || "😀"} Pick Emoji
      </button>
      <Portal>
        <div {...popoverApi().getPositionerProps()}>
          <div
            {...mergeProps(() => popoverApi().getContentProps(), { style: { width: "100%" } })}
            class="emoji-picker-popover"
          >
            {props.children}
          </div>
        </div>
      </Portal>
    </>
  )
}

const COLUMN_COUNT = 8
const CELL_SIZE = 46

function EmojiGrid(props: { listboxApi: listbox.Api }) {
  const items = () => props.listboxApi.collection.items as EmojiItem[]
  const rowCount = () => Math.ceil(items().length / COLUMN_COUNT)

  const { virtualizer, ref } = useGridVirtualizer({
    rowCount: rowCount(),
    columnCount: COLUMN_COUNT,
    estimatedRowSize: () => CELL_SIZE,
    estimatedColumnSize: () => CELL_SIZE,
    observeScrollElementSize: true,
  })

  createComputed(on(rowCount, (rowCount) => virtualizer.updateOptions({ rowCount })))

  const getItemAtPosition = (rowIndex: number, colIndex: number) => {
    return items()[rowIndex * COLUMN_COUNT + colIndex] || null
  }

  return (
    <div
      {...mergeProps(() => props.listboxApi.getContentProps(), {
        style: { padding: "0", "text-align": "center" } as JSX.CSSProperties,
      })}
      class="emoji-grid-container"
    >
      <div
        ref={ref}
        onScroll={virtualizer.handleScroll}
        style={{ ...virtualizer.getContainerStyle(), height: "100%", width: "400px", padding: "4px" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalHeight()}px`,
            width: `${virtualizer.getTotalWidth()}px`,
            position: "relative",
          }}
        >
          <Index each={virtualizer.getVirtualRows()}>
            {(virtualRow) => (
              <div style={virtualizer.getRowStyle(virtualRow())}>
                <Index each={virtualRow().columns}>
                  {(column) => {
                    const item = () => getItemAtPosition(virtualRow().row, column().column)
                    const cellStyle = (): JSX.CSSProperties => ({
                      position: "absolute",
                      top: 0,
                      left: `${column().x}px`,
                      width: `${column().width}px`,
                      height: `${virtualRow().height}px`,
                    })
                    return (
                      <Show when={item()} fallback={<div class="emoji-item-empty" style={cellStyle()} />}>
                        {(item) => (
                          <div
                            {...props.listboxApi.getItemProps({ item: item() })}
                            class="emoji-item"
                            title={item().label}
                            style={cellStyle()}
                          >
                            <span {...props.listboxApi.getItemTextProps({ item: item() })}>{item().emoji}</span>
                          </div>
                        )}
                      </Show>
                    )
                  }}
                </Index>
              </div>
            )}
          </Index>
        </div>
      </div>
    </div>
  )
}

function EmojiEmpty(props: { listboxApi: listbox.Api; searchQuery: string; loading: boolean }) {
  return (
    <Show when={props.listboxApi.collection.size === 0 && !props.loading}>
      <div class="emoji-picker-empty">{props.searchQuery ? "No emojis found" : "No emojis available"}</div>
    </Show>
  )
}

function EmojiSearch(props: { listboxApi: listbox.Api; emojiPicker: EmojiPickerApi }) {
  return (
    <div class="emoji-picker-search">
      <div class="search-input-container">
        <input
          type="text"
          placeholder="Search emojis..."
          value={props.emojiPicker.searchQuery()}
          class={`emoji-search-input ${props.emojiPicker.isSearching() ? "searching" : ""}`}
          {...mergeProps(() => props.listboxApi.getInputProps({ autoHighlight: true }), {
            onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
              props.emojiPicker.setSearchQuery(event.currentTarget.value)
            },
            onKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
              if (event.key === "Tab") {
                event.preventDefault()
                props.emojiPicker.cycleCategory(event.shiftKey ? "previous" : "next")
                event.currentTarget.focus()
              }
            },
          })}
        />
        <Show when={props.emojiPicker.isSearching()}>
          <div class="search-indicator">⏳</div>
        </Show>
      </div>
    </div>
  )
}

function EmojiSkinToneSelector(props: { emojiPicker: EmojiPickerApi }) {
  return (
    <div class="emoji-skin-tone-selector">
      <For each={Object.keys(props.emojiPicker.emojiData()?.skinTones || {})}>
        {(skinTone) => (
          <button
            onClick={() => props.emojiPicker.setSelectedSkinTone(validateSkinTone(skinTone))}
            class={`skin-tone-button ${props.emojiPicker.selectedSkinTone() === skinTone ? "selected" : ""}`}
            title={props.emojiPicker.emojiData()?.skinTones[skinTone as SkinTone] || skinTone}
          >
            {getSkinToneEmoji(skinTone as SkinTone)}
          </button>
        )}
      </For>
    </div>
  )
}

function EmojiCategorySelector(props: { emojiPicker: EmojiPickerApi }) {
  return (
    <div class="emoji-picker-categories">
      <For each={EMOJI_CATEGORIES}>
        {(category) => (
          <div
            onClick={() => props.emojiPicker.selectCategory(category.id)}
            class={`category-button ${props.emojiPicker.selectedCategory() === category.id ? "selected" : ""}`}
            title={category.label}
          >
            {category.icon}
          </div>
        )}
      </For>
    </div>
  )
}

export default function Page() {
  const emojiPicker = useEmojiPicker()

  const collection = createMemo(() =>
    listbox.gridCollection({
      items: emojiPicker.filteredEmojis(),
      columnCount: COLUMN_COUNT,
    }),
  )

  const id = createUniqueId()

  const listboxService = useMachine(listbox.machine, (): listbox.Props => ({
    collection: collection(),
    id,
    onSelect: (details) => {
      emojiPicker.setSelectedEmoji(details.value)
      document.dispatchEvent(new CustomEvent("emoji:select", { detail: details.value }))
    },
  }))

  const listboxApi = createMemo(() => listbox.connect(listboxService, normalizeProps))

  return (
    <main class="emoji-picker-container">
      <EmojiPopover selectedEmoji={emojiPicker.selectedEmoji()}>
        <div class="emoji-picker-header">
          <EmojiSearch listboxApi={listboxApi()} emojiPicker={emojiPicker} />
          <EmojiSkinToneSelector emojiPicker={emojiPicker} />
        </div>

        <Show when={!emojiPicker.loading()} fallback={<div class="emoji-picker-loading">Loading emojis...</div>}>
          <div {...listboxApi().getRootProps()} class="emoji-picker-listbox">
            <EmojiGrid listboxApi={listboxApi()} />
            <EmojiEmpty
              listboxApi={listboxApi()}
              searchQuery={emojiPicker.searchQuery()}
              loading={emojiPicker.loading()}
            />
          </div>
        </Show>
        <EmojiCategorySelector emojiPicker={emojiPicker} />
      </EmojiPopover>

      <style>{`
  .emoji-picker-container {
    position: relative;
    display: inline-block;
  }

  .emoji-picker-popover {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 16px;
    z-index: 1000;
  }

  .emoji-picker-header {
    margin-bottom: 16px;
  }

  .search-input-container {
    position: relative;
    margin-bottom: 12px;
  }

  .emoji-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    padding-right: 40px;
  }

  .emoji-search-input.searching {
    border-color: #3b82f6;
  }

  .search-indicator {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    pointer-events: none;
  }

  .emoji-skin-tone-selector {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .emoji-grid-container {
    height: 300px;
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }


  .skin-tone-button {
    width: 32px;
    height: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 16px;
  }

  .skin-tone-button.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .emoji-picker-categories {
    display: flex;
    gap: 4px;
    margin-top: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .category-button {
    min-width: 32px;
    height: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .category-button.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .emoji-picker-loading,
  .emoji-picker-empty {
    text-align: center;
    padding: 32px;
    color: #6b7280;
    font-size: 14px;
  }

  .emoji-item {
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    transition: background-color 0.15s ease;
    box-sizing: border-box;
  }

  .emoji-item:hover {
    background: #f8fafc;
  }

  .emoji-item-empty {
    width: 100%;
    height: 100%;
  }

  .emoji-item[data-selected] {
    background: #eff6ff;
    outline: 2px solid #3b82f6;
  }
`}</style>
    </main>
  )
}
