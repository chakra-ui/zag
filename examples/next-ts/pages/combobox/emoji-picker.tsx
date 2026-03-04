import * as listbox from "@zag-js/listbox"
import * as popover from "@zag-js/popover"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { memo, useEffect, useId, useMemo, useRef, useState } from "react"
import { experimental_VGrid as VGrid } from "virtua"
import { EmojiData, EmojiLoader, SkinTone, validateSkinTone } from "../../lib/emoji-loader"

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
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null)
  const [isEmojiLoading, setIsEmojiLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone>("none")
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const searchIndexRef = useRef<SearchIndex[]>([])

  const emojiLoader = useMemo(() => new EmojiLoader({ locale: "en" }), [])

  useEffect(() => {
    const loadEmojis = async () => {
      setIsEmojiLoading(true)
      try {
        const data = await emojiLoader.load()
        setEmojiData(data)
      } catch (error) {
        console.error("Failed to load emoji data:", error)
      } finally {
        setIsEmojiLoading(false)
      }
    }
    loadEmojis()
  }, [emojiLoader])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build search index when emoji data changes
  const processedEmojis = useMemo(() => {
    if (!emojiData) return []

    const emojis: EmojiItem[] = []
    const searchIndex: SearchIndex[] = []

    for (const emoji of emojiData.emojis) {
      let displayEmoji = emoji.emoji
      if (selectedSkinTone !== "none" && emoji.skins && selectedSkinTone in emoji.skins) {
        displayEmoji = emoji.skins[selectedSkinTone as Exclude<SkinTone, "none">]
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
      searchIndex.push({ emoji: emojiItem, searchText })
    }

    searchIndexRef.current = searchIndex
    return emojis
  }, [emojiData, selectedSkinTone])

  const filteredEmojis = useMemo(() => {
    if (!processedEmojis.length) return []

    let emojis = processedEmojis

    // Filter by category first (fastest)
    if (selectedCategory !== null) {
      emojis = emojis.filter((emoji) => emoji.category === selectedCategory)
    }

    // Filter by search using pre-built index with early termination
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      const relevantEntries =
        selectedCategory !== null
          ? searchIndexRef.current.filter((entry) => entry.emoji.category === selectedCategory)
          : searchIndexRef.current

      const searchResults = new Set<EmojiItem>()

      // Use for-loop for better performance and early termination possibility
      for (let i = 0; i < relevantEntries.length; i++) {
        const entry = relevantEntries[i]
        if (entry.searchText.includes(query)) {
          searchResults.add(entry.emoji)
        }
      }

      return Array.from(searchResults)
    }

    return emojis
  }, [processedEmojis, selectedCategory, debouncedSearchQuery])

  const selectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
  }

  const cycleCategory = (direction: "next" | "previous") => {
    if (direction === "next") {
      const currentIndex =
        selectedCategory === null ? -1 : EMOJI_CATEGORIES.findIndex((cat) => cat.id === selectedCategory)
      const nextIndex = currentIndex + 1
      if (nextIndex < EMOJI_CATEGORIES.length) {
        selectCategory(EMOJI_CATEGORIES[nextIndex].id)
      } else {
        // Wrap to first category
        selectCategory(EMOJI_CATEGORIES[0].id)
      }
    } else {
      const currentIndex =
        selectedCategory === null ? -1 : EMOJI_CATEGORIES.findIndex((cat) => cat.id === selectedCategory)
      const nextIndex = currentIndex - 1
      if (nextIndex >= 0) {
        selectCategory(EMOJI_CATEGORIES[nextIndex].id)
      } else {
        // Wrap to last category
        selectCategory(EMOJI_CATEGORIES[EMOJI_CATEGORIES.length - 1].id)
      }
    }
  }

  const isSearching = searchQuery !== debouncedSearchQuery

  return {
    emojiData,
    loading: isEmojiLoading,
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

const EmojiPopover = memo((props: React.PropsWithChildren<{ selectedEmoji: string }>) => {
  const { selectedEmoji, children } = props
  const popoverService = useMachine(popover.machine, { id: useId() })
  const popoverApi = popover.connect(popoverService, normalizeProps)

  useEffect(() => {
    const onEmojiSelect = () => {
      popoverApi.setOpen(false)
    }
    document.addEventListener("emoji:select", onEmojiSelect)
    return () => {
      document.removeEventListener("emoji:select", onEmojiSelect)
    }
  }, [popoverApi])

  return (
    <>
      <button {...popoverApi.getTriggerProps()} className="emoji-picker-trigger">
        {selectedEmoji || "😀"} Pick Emoji
      </button>
      <Portal>
        <div {...popoverApi.getPositionerProps()}>
          <div
            {...mergeProps(popoverApi.getContentProps(), {
              style: { width: "100%" },
            })}
            className="emoji-picker-popover"
          >
            {children}
          </div>
        </div>
      </Portal>
    </>
  )
})

const EmojiGrid = memo((props: { listboxApi: listbox.Api }) => {
  const { listboxApi } = props
  const items = listboxApi.collection.items
  const columnCount = 8
  const rowCount = Math.ceil(items.length / columnCount)

  const getItemAtPosition = (rowIndex: number, colIndex: number) => {
    const index = rowIndex * columnCount + colIndex
    return items[index] || null
  }

  return (
    <div
      {...mergeProps(listboxApi.getContentProps(), { style: { padding: 0, textAlign: "center" } })}
      className="emoji-grid-container"
    >
      <VGrid
        style={{ height: "100%", width: "400px", padding: "4px" }}
        row={rowCount}
        col={columnCount}
        cellHeight={46}
        cellWidth={46}
      >
        {({ rowIndex, colIndex }) => {
          const item = getItemAtPosition(rowIndex, colIndex)
          if (!item) return <div className="emoji-item-empty" />
          return (
            <div
              key={`${item.value}-${rowIndex}-${colIndex}`}
              {...listboxApi.getItemProps({ item })}
              className="emoji-item"
              title={item.label}
            >
              <span {...listboxApi.getItemTextProps({ item })}>{item.emoji}</span>
            </div>
          )
        }}
      </VGrid>
    </div>
  )
})

const EmojiEmpty = memo((props: { listboxApi: listbox.Api; searchQuery: string; loading: boolean }) => {
  const { listboxApi, searchQuery, loading } = props
  return (
    <>
      {listboxApi.collection.size === 0 && !loading && (
        <div className="emoji-picker-empty">{searchQuery ? "No emojis found" : "No emojis available"}</div>
      )}
    </>
  )
})

const EmojiSearch = memo((props: { listboxApi: listbox.Api; emojiPicker: EmojiPickerApi }) => {
  const { listboxApi, emojiPicker } = props
  return (
    <div className="emoji-picker-search">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search emojis..."
          value={emojiPicker.searchQuery}
          onChange={(e) => emojiPicker.setSearchQuery(e.currentTarget.value)}
          className={`emoji-search-input ${emojiPicker.isSearching ? "searching" : ""}`}
          {...mergeProps(listboxApi.getInputProps({ autoHighlight: true }), {
            onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
              if (event.key === "Tab") {
                event.preventDefault()
                emojiPicker.cycleCategory(event.shiftKey ? "previous" : "next")
                event.currentTarget.focus()
              }
            },
          })}
        />
        {emojiPicker.isSearching && <div className="search-indicator">⏳</div>}
      </div>
    </div>
  )
})

const EmojiSkinToneSelector = memo((props: { emojiPicker: EmojiPickerApi }) => {
  const { emojiPicker } = props
  return (
    <div className="emoji-skin-tone-selector">
      {Object.keys(emojiPicker.emojiData?.skinTones || {}).map((skinTone) => (
        <button
          key={skinTone}
          onClick={() => emojiPicker.setSelectedSkinTone(validateSkinTone(skinTone))}
          className={`skin-tone-button ${emojiPicker.selectedSkinTone === skinTone ? "selected" : ""}`}
          title={emojiPicker.emojiData?.skinTones[skinTone as SkinTone] || skinTone}
        >
          {getSkinToneEmoji(skinTone as SkinTone)}
        </button>
      ))}
    </div>
  )
})

const EmojiCategorySelector = memo((props: { emojiPicker: EmojiPickerApi }) => {
  const { emojiPicker } = props
  return (
    <div className="emoji-picker-categories">
      {EMOJI_CATEGORIES.map((category) => (
        <div
          key={category.id}
          onClick={() => emojiPicker.selectCategory(category.id)}
          className={`category-button ${emojiPicker.selectedCategory === category.id ? "selected" : ""}`}
          title={category.label}
        >
          {category.icon}
        </div>
      ))}
    </div>
  )
})

export default function EmojiPicker() {
  const emojiPicker = useEmojiPicker()

  const collection = useMemo(
    () =>
      listbox.gridCollection({
        items: emojiPicker.filteredEmojis,
        columnCount: 8,
      }),
    [emojiPicker.filteredEmojis],
  )

  const listboxService = useMachine(listbox.machine, {
    collection,
    id: useId(),
    onSelect: (details) => {
      emojiPicker.setSelectedEmoji(details.value)
      document.dispatchEvent(new CustomEvent("emoji:select", { detail: details.value }))
    },
  })

  const listboxApi = listbox.connect(listboxService, normalizeProps)

  return (
    <main className="emoji-picker-container">
      <EmojiPopover selectedEmoji={emojiPicker.selectedEmoji}>
        <div className="emoji-picker-header">
          <EmojiSearch listboxApi={listboxApi} emojiPicker={emojiPicker} />
          <EmojiSkinToneSelector emojiPicker={emojiPicker} />
        </div>

        {emojiPicker.loading ? (
          <div className="emoji-picker-loading">Loading emojis...</div>
        ) : (
          <div {...listboxApi.getRootProps()} className="emoji-picker-listbox">
            <EmojiGrid listboxApi={listboxApi} />
            <EmojiEmpty listboxApi={listboxApi} searchQuery={emojiPicker.searchQuery} loading={emojiPicker.loading} />
          </div>
        )}
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
