import * as asyncList from "@zag-js/async-list"
import { createInfiniteScroll, getSentinelProps } from "@zag-js/infinite-scroll"
import { useMachine } from "@zag-js/react"
import { useEffect, useRef } from "react"

interface Person {
  name: string
  url: string
}

export default function Page() {
  const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
    async load({ signal, cursor }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/", { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next }
    },
  })

  const api = asyncList.connect(service)

  const sentinelRef = useRef<HTMLLIElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || !scrollerRef.current) return
    return createInfiniteScroll({
      sentinelEl: sentinelRef.current,
      scrollerEl: scrollerRef.current,
      hasMore: api.hasMore,
      loading: api.isLoading,
      threshold: "200px",
      onLoadMore: () => api.loadMore(),
    })
  }, [api.hasMore, api.isLoading])

  return (
    <main className="infinite-scroll">
      <h1>Infinite Scroll — Async List</h1>
      <p>Loaded {api.items.length}</p>
      <div
        ref={scrollerRef}
        style={{
          height: 360,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {api.items.map((item) => (
            <li
              key={item.url}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
              }}
            >
              {item.name}
            </li>
          ))}
          <li ref={sentinelRef} {...getSentinelProps()} />
        </ul>
        <div style={{ padding: 12, textAlign: "center", color: "#666" }}>
          {api.isLoading && "Loading…"}
          {!api.isLoading && !api.hasMore && "End of list"}
        </div>
      </div>
    </main>
  )
}
