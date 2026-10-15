"use client"

import { useAsyncList } from "@/hooks/use-async-list"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import "@styles/infinite-scroll.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
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

  const scroll = useInfiniteScroll({
    count: list.items.length,
    hasMore: list.hasMore,
    loading: list.isLoading,
    onLoadMore: () => list.loadMore(),
  })

  const searching = list.isLoading && !list.isLoadingMore

  return (
    <main className="infinite-scroll">
      <input
        type="search"
        aria-label="Search people"
        placeholder="Search people…"
        onChange={(event) => list.setFilter(event.currentTarget.value)}
      />
      <p data-testid="summary">
        {list.items.length} loaded{searching && " · Searching…"}
      </p>

      <div className="scroller" tabIndex={0} aria-busy={list.isLoading || undefined}>
        <ul>
          {list.items.map((item) => (
            <li key={item.url}>
              {item.name} <small>{item.birth_year}</small>
            </li>
          ))}
        </ul>
        {!list.isLoading && list.isEmpty && <div className="footer">No people found</div>}
        <div {...scroll.getSentinelProps()} />
        {list.isLoadingMore && <div {...scroll.getIndicatorProps({ type: "loading" })}>Loading more…</div>}
        {!list.isLoading && !list.isEmpty && (
          <div {...scroll.getIndicatorProps({ type: "complete" })}>You’ve reached the end</div>
        )}
      </div>
    </main>
  )
}
