"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useAsyncList } from "@/hooks/use-async-list"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
  const list = useAsyncList<Person>({
    autoReload: true,
    initialFilter: "",
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter, cursor }) {
      const search = encodeURIComponent(filter.trim())
      const response = await fetch(cursor ?? `https://swapi.py4e.com/api/people/?search=${search}`, { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results ?? [], cursor: data.next ?? undefined }
    },
  })

  const scroll = useInfiniteScroll({
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  })

  const searching = list.isLoading && !list.isLoadingMore

  return (
    <main>
      <div className="async-list">
        <div className="async-list-toolbar">
          <input
            type="search"
            aria-label="Search people"
            placeholder="Search people…"
            onChange={(event) => list.setFilter(event.currentTarget.value)}
          />
          <span className="async-list-meta" data-testid="summary">
            {searching ? "Searching…" : `${list.items.length} loaded`}
          </span>
        </div>

        <div className="async-list-panel async-list-scroller" tabIndex={0} aria-label="People">
          {list.error ? (
            <div role="alert" className="async-list-status" data-type="error">
              Couldn’t load people.
              <button onClick={() => list.reload()}>Retry</button>
            </div>
          ) : list.isEmpty && list.isLoading ? (
            <div role="status" className="async-list-status">
              <LoaderCircleIcon className="async-list-spinner" /> Loading people…
            </div>
          ) : list.isEmpty ? (
            <div className="async-list-status">No people found</div>
          ) : (
            <ul className="async-list-items" aria-busy={searching}>
              {list.items.map((person) => (
                <li key={person.url}>
                  {person.name}
                  <span className="async-list-meta">{person.birth_year}</span>
                </li>
              ))}
            </ul>
          )}
          <div {...scroll.getSentinelProps()} />
          {list.isLoadingMore && (
            <div {...scroll.getIndicatorProps({ type: "loading" })} className="async-list-status">
              <LoaderCircleIcon className="async-list-spinner" /> Loading more…
            </div>
          )}
          {!list.isLoading && !list.isEmpty && (
            <div {...scroll.getIndicatorProps({ type: "complete" })} className="async-list-status">
              You’ve reached the end
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
