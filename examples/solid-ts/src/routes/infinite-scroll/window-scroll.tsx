import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 20
const TOTAL = 80

const loadPage = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    const start = (page - 1) * PAGE_SIZE
    setTimeout(() => {
      resolve(Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => `Entry ${start + i + 1}`))
    }, 500)
  })

export default function Page() {
  const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
    autoReload: true,
    async load({ cursor }) {
      const page = cursor ? Number(cursor) : 1
      const items = await loadPage(page)
      return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
    },
  })
  const list = createMemo(() => asyncList.connect(listService))

  // No viewport part is rendered — the page itself is the scroller.
  const service = useMachine(infiniteScroll.machine, () => ({
    id: createUniqueId(),
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const api = createMemo(() => infiniteScroll.connect(service, normalizeProps))

  return (
    <>
      {/* The app shell makes `main` the scroller, so it needs to be keyboard reachable. */}
      <main class="infinite-scroll" tabIndex={0}>
        <h1>Infinite Scroll — Window scroll</h1>
        <p>
          Loaded {list().items.length} / {TOTAL}
        </p>
        <ul>
          <For each={list().items}>{(item) => <li>{item}</li>}</For>
        </ul>
        <div {...api().getSentinelProps()} />
        <div {...api().getIndicatorProps({ type: "loading" })}>Loading…</div>
        <div {...api().getIndicatorProps({ type: "complete" })}>End of list</div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
