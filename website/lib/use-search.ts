import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { normalizeProps, useMachine } from "@zag-js/react"
import { matchSorter } from "match-sorter"
import { useRouter } from "next/navigation"
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
    openOnChange({ inputValue }) {
      return inputValue.length > 2
    },
    navigate({ value }) {
      if (value) router.push(value)
    },
    onValueChange() {
      dialog_api.setOpen(false)
    },
    onInputValueChange({ inputValue }) {
      if (inputValue.length < 3) return
      // resolves right away once loaded, and waits if the user typed first
      loadSearchIndex().then(
        (data) => {
          const results = matchSorter(data, inputValue, {
            keys: [
              "hierarchy.lvl1",
              "hierarchy.lvl2",
              "hierarchy.lvl3",
              "content",
            ],
          })
          setResults(results.slice(0, 10))
        },
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

  useUpdateEffect(() => {
    if (dialog_api.open && isInputEmpty) {
      setResults([])
    }
  }, [dialog_api.open, isInputEmpty])

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
