import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/react"
import { matchSorter } from "match-sorter"
import { useRouter } from "next/navigation"
import { useEffect, useId, useMemo, useState } from "react"
import {
  searchData,
  type SearchMetaItem,
  type SearchMetaResult,
} from "./search-meta"
import { useUpdateEffect } from "./use-update-effect"

interface UseSearchReturn {
  results: SearchMetaItem[]
  dialog_api: dialog.Api
  combobox_api: combobox.Api
}

export function useSearch(): UseSearchReturn {
  const dialog_service = useMachine(dialog.machine, {
    id: useId(),
  })

  const dialog_api = dialog.connect(dialog_service, normalizeProps)

  const [results, setResults] = useState<SearchMetaResult>(searchData)

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
    id: useId(),
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
      const results = matchSorter(searchData, inputValue, {
        keys: ["hierarchy.lvl1", "hierarchy.lvl2", "hierarchy.lvl3", "content"],
      })
      setResults(results.slice(0, 10))
    },
  })

  useEffect(() => {
    const fn = (event: KeyboardEvent) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
      const hotkey = isMac ? "metaKey" : "ctrlKey"
      if (event.key?.toLowerCase() === "k" && event[hotkey]) {
        event.preventDefault()
        dialog_api.setOpen(dialog_api.open ? false : true)
      }
    }
    document.addEventListener("keydown", fn)
    return () => {
      document.removeEventListener("keydown", fn)
    }
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
