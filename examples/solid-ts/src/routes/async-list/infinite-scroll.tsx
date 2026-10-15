import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/solid"
import { LoaderCircleIcon } from "lucide-solid"
import { createMemo, For, Match, Show, Switch } from "solid-js"
import { useInfiniteScroll } from "~/hooks/use-infinite-scroll"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
  const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
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
  const list = createMemo(() => asyncList.connect(service))

  const scroll = useInfiniteScroll(() => ({
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const searching = () => list().isLoading && !list().isLoadingMore

  return (
    <main>
      <div class="async-list">
        <div class="async-list-toolbar">
          <input
            type="search"
            aria-label="Search people"
            placeholder="Search people…"
            onInput={(event) => list().setFilter(event.currentTarget.value)}
          />
          <span class="async-list-meta" data-testid="summary">
            {searching() ? "Searching…" : `${list().items.length} loaded`}
          </span>
        </div>

        <div class="async-list-panel async-list-scroller" tabIndex={0} aria-label="People">
          <Switch>
            <Match when={list().error}>
              <div role="alert" class="async-list-status" data-type="error">
                Couldn’t load people.
                <button onClick={() => list().reload()}>Retry</button>
              </div>
            </Match>
            <Match when={list().isEmpty && list().isLoading}>
              <div role="status" class="async-list-status">
                <LoaderCircleIcon class="async-list-spinner" /> Loading people…
              </div>
            </Match>
            <Match when={list().isEmpty}>
              <div class="async-list-status">No people found</div>
            </Match>
            <Match when={true}>
              <ul class="async-list-items" aria-busy={searching()}>
                <For each={list().items}>
                  {(person) => (
                    <li>
                      {person.name}
                      <span class="async-list-meta">{person.birth_year}</span>
                    </li>
                  )}
                </For>
              </ul>
            </Match>
          </Switch>
          <div {...scroll().getSentinelProps()} />
          <Show when={list().isLoadingMore}>
            <div {...scroll().getIndicatorProps({ type: "loading" })} class="async-list-status">
              <LoaderCircleIcon class="async-list-spinner" /> Loading more…
            </div>
          </Show>
          <Show when={!list().isLoading && !list().isEmpty}>
            <div {...scroll().getIndicatorProps({ type: "complete" })} class="async-list-status">
              You’ve reached the end
            </div>
          </Show>
        </div>
      </div>
    </main>
  )
}
