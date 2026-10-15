"use client"

import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Output } from "@/components/output"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/combobox.css"

interface Person {
  name: string
  url: string
  birth_year?: string
}

// Resolves after `ms`, or rejects when the request is superseded
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

export default function Page() {
  const [selected, setSelected] = useState<string[]>([])

  const list = useAsyncList<Person>({
    autoReload: true,
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter }) {
      // Debounce: each keystroke aborts the pending wait
      await delay(250, signal)
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [] }
    },
  })

  const collection = useMemo(
    () =>
      combobox.collection({
        items: list.items,
        itemToValue: (item) => item.name,
        itemToString: (item) => item.name,
      }),
    [list.items],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Person>, {
    id: useId(),
    collection,
    placeholder: "Search people…",
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.setFilter(inputValue)
    },
    onValueChange({ value }) {
      setSelected(value)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  const query = list.filter?.trim()
  const status = list.error
    ? null
    : list.isLoading && list.isEmpty
      ? "Searching…"
      : !list.isLoading && list.isEmpty
        ? query
          ? `No people match “${query}”`
          : "No people found"
        : null

  return (
    <main className="combobox">
      <div className="vstack gap-6">
        <Output label="Selected" value={selected.join(", ") || "—"} data-testid="selected-value" />

        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Star Wars character</label>
          <div {...api.getControlProps()}>
            <input data-testid="input" {...api.getInputProps()} />
            {list.isLoading && <LoaderCircleIcon className="combobox-spinner" aria-hidden data-testid="loading" />}
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
            <button data-testid="trigger" {...api.getTriggerProps()}>
              <ChevronsUpDownIcon />
            </button>
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div data-testid="combobox-content" {...api.getContentProps()} aria-busy={list.isLoading || undefined}>
            <div {...api.getEmptyProps()}>
              {list.error ? (
                <span className="combobox-status" data-type="error">
                  Couldn’t load people.
                  <button type="button" onClick={() => list.reload()}>
                    Retry
                  </button>
                </span>
              ) : (
                status
              )}
            </div>
            {!list.isEmpty && (
              <div {...api.getListProps()}>
                {list.items.map((item) => (
                  <div key={item.name} data-testid={`item-${item.name}`} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.name}</span>
                    {item.birth_year && <span className="combobox-item-meta">{item.birth_year}</span>}
                    <span {...api.getItemIndicatorProps({ item })}>
                      <CheckIcon />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
