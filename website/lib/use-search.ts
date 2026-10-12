import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { normalizeProps, useMachine } from "@zag-js/react"
import { matchSorter, rankings } from "match-sorter"
import { useRouter } from "next/navigation"
import { tabs } from "sidebar.config"
import { useEffect, useMemo, useState } from "react"
import type { SearchMetaItem, SearchMetaResult } from "./search-meta"
import { useUpdateEffect } from "./use-update-effect"

interface UseSearchReturn {
  results: SearchMetaItem[]
  dialog_api: dialog.Api
  combobox_api: combobox.Api
}

export const SEARCH_HOTKEY = "mod+k"

// One fetch shared by every caller. A failed fetch clears it so the next call retries
let searchIndex: Promise<SearchMetaResult> | null = null

export function loadSearchIndex() {
  searchIndex ??= fetch("/search.json")
    .then((res) => {
      if (!res.ok) throw new Error(`search index: ${res.status}`)
      return res.json() as Promise<SearchMetaResult>
    })
    .catch((error) => {
      searchIndex = null
      throw error
    })
  return searchIndex
}

// Short queries match too loosely, so they keep showing the starting pages
const MIN_QUERY = 3

// Before there's a query, search lists the overview and guide pages in sidebar order
const suggestedUrls = tabs
  .filter((tab) => tab.id === "overview" || tab.id === "guides")
  .flatMap((tab) => tab.groups.flatMap((group) => group.items))
  .filter((item) => !item.href)
  .map((item) => `/${item.section}/${item.id}`)

const getSuggestions = (data: SearchMetaResult) =>
  suggestedUrls.flatMap((url) => data.find((item) => item.url === url) ?? [])

function rankResults(data: SearchMetaResult, query: string) {
  return matchSorter(data, query, {
    // a match on an entry's own title beats a match on its page, section or text
    // no typo matching: on titles it turns "inert" into "keyboard interactions"
    threshold: rankings.CONTAINS,
    keys: ["content", "hierarchy.lvl1", "hierarchy.lvl2", "text"],
    // on a tie, the page comes before its headings
    baseSort: (a, b) =>
      Number(b.item.type === "lvl1") - Number(a.item.type === "lvl1") ||
      a.index - b.index,
  }).slice(0, 10)
}

export const prefetchSearchIndex = () => {
  loadSearchIndex().catch(() => {})
}

export function useSearch(): UseSearchReturn {
  const dialog_service = useMachine(dialog.machine, {
    id: "search-dialog",
  })

  const dialog_api = dialog.connect(dialog_service, normalizeProps)

  const [results, setResults] = useState<SearchMetaResult>([])

  // Fetch the index once the page is idle, so it's ready for keyboard users
  // who go straight for the hotkey. Hovering or focusing the trigger also starts it
  useEffect(() => {
    if (typeof window.requestIdleCallback !== "function") {
      const timer = setTimeout(prefetchSearchIndex, 2000)
      return () => clearTimeout(timer)
    }
    const handle = requestIdleCallback(prefetchSearchIndex, { timeout: 5000 })
    return () => cancelIdleCallback(handle)
  }, [])

  const collection = useMemo(
    () =>
      combobox.collection({
        items: results,
        itemToValue(item) {
          return item.url
        },
        itemToString(item) {
          return JSON.stringify(item)
        },
      }),
    [results],
  )

  const router = useRouter()

  const combobox_service = useMachine(combobox.machine, {
    id: "search-combobox",
    placeholder: "Search the docs",
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    collection,
    navigate({ value }) {
      if (value) router.push(value)
    },
    onValueChange() {
      dialog_api.setOpen(false)
    },
    onInputValueChange({ inputValue }) {
      const query = inputValue.trim()
      // resolves right away once loaded, and waits if the user typed first
      loadSearchIndex().then(
        (data) =>
          setResults(
            query.length < MIN_QUERY
              ? getSuggestions(data)
              : rankResults(data, query),
          ),
        () => {},
      )
    },
  })

  useEffect(() => {
    // `mod` is ⌘ on Apple platforms and Ctrl elsewhere
    const store = createHotkeyStore({ target: document })
    store.register({
      id: "toggle-search",
      hotkey: SEARCH_HOTKEY,
      // also from the search input, so the same keys close it
      options: { preventDefault: true, enableOnFormTags: ["input"] },
      action: () => dialog_api.setOpen(!dialog_api.open),
    })
    return () => store.destroy()
  }, [dialog_api.setOpen, dialog_api.open])

  const combobox_api = combobox.connect(combobox_service, normalizeProps)

  const isInputEmpty = combobox_api.inputValue.trim() === ""

  // opening search lists the starting pages right away
  useEffect(() => {
    if (!dialog_api.open) return
    loadSearchIndex().then(
      (data) => {
        setResults(getSuggestions(data))
        combobox_api.setOpen(true)
      },
      () => {},
    )
    // combobox_api is rebuilt every render, so only the open state drives this
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog_api.open])

  useUpdateEffect(() => {
    if (!dialog_api.open && !isInputEmpty) {
      combobox_api.clearValue()
    }
  }, [dialog_api.open, isInputEmpty, combobox_api.clearValue])

  return {
    results,
    dialog_api,
    combobox_api,
  }
}
