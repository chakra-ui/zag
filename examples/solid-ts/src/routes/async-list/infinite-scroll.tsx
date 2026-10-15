import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/solid"
import { createMemo, For, Show } from "solid-js"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"
import "@styles/infinite-scroll.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
  const listService = useMachine(asyncList.machine as asyncList.Machine<Person>, {
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
  const list = createMemo(() => asyncList.connect(listService))

  const scroll = useInfiniteScroll(() => ({
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const searching = () => list().isLoading && !list().isLoadingMore

  return (
    <main class="infinite-scroll">
      <input
        type="search"
        aria-label="Search people"
        placeholder="Search people…"
        onInput={(event) => list().setFilter(event.currentTarget.value)}
      />
      <p data-testid="summary">
        {list().items.length} loaded{searching() && " · Searching…"}
      </p>

      <div class="scroller" tabIndex={0} aria-busy={list().isLoading || undefined}>
        <ul>
          <For each={list().items}>
            {(item) => (
              <li>
                {item.name} <small>{item.birth_year}</small>
              </li>
            )}
          </For>
        </ul>
        <Show when={!list().isLoading && list().isEmpty}>
          <div class="footer">No people found</div>
        </Show>
        <div {...scroll().getSentinelProps()} />
        <Show when={list().isLoadingMore}>
          <div {...scroll().getIndicatorProps({ type: "loading" })}>Loading more…</div>
        </Show>
        <Show when={!list().isLoading && !list().isEmpty}>
          <div {...scroll().getIndicatorProps({ type: "complete" })}>You’ve reached the end</div>
        </Show>
      </div>
    </main>
  )
}
