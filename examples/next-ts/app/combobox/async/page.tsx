"use client"

import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Output } from "@/components/output"
import { useAsyncList } from "@/hooks/use-async-list"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import "@styles/combobox.css"

interface Person {
  name: string
  url: string
  birth_year?: string
}

export default function Page() {
  const id = useId()
  const spinnerId = `${id}-spinner`
  const [selected, setSelected] = useState<string[]>([])

  const list = useAsyncList<Person>({
    autoReload: true,
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter, cursor }) {
      const search = encodeURIComponent(filter?.trim() ?? "")
      const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [], cursor: data.next ?? undefined }
    },
  })

  const collection = useMemo(
    () =>
      combobox.collection({
        items: list.items,
        itemToValue: (item) => item.url,
        itemToString: (item) => item.name,
      }),
    [list.items],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Person>, {
    id,
    collection,
    placeholder: "Search people…",
    // Wrapping to the top would skip the next page
    loopFocus: false,
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.setFilter(inputValue)
    },
    onValueChange({ items }) {
      setSelected(items.map((item) => item.name))
    },
  })

  const api = combobox.connect(service, normalizeProps)

  // Load-more has its own spinner at the end of the list
  const searching = list.isLoading && !list.isLoadingMore

  const scroll = useInfiniteScroll({
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  })

  const query = list.filter?.trim()
  const status = list.error
    ? null
    : list.isEmpty && searching
      ? "Searching…"
      : list.isEmpty
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
            <input data-testid="input" {...api.getInputProps()} aria-describedby={searching ? spinnerId : undefined} />
            {searching && (
              <span
                id={spinnerId}
                role="progressbar"
                aria-label="Loading results"
                className="combobox-spinner"
                data-testid="loading"
              >
                <LoaderCircleIcon />
              </span>
            )}
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
                  <div key={item.url} data-testid={`item-${item.name}`} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.name}</span>
                    {item.birth_year && <span className="combobox-item-meta">{item.birth_year}</span>}
                    <span {...api.getItemIndicatorProps({ item })}>
                      <CheckIcon />
                    </span>
                  </div>
                ))}
                <div {...scroll.getSentinelProps()} />
                {list.isLoadingMore && (
                  <div className="combobox-load-more" role="progressbar" aria-label="Loading more people">
                    <span className="combobox-spinner">
                      <LoaderCircleIcon />
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
