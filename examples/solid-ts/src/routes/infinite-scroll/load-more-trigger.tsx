import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 20
const TOTAL = 80

const loadPage = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    const start = (page - 1) * PAGE_SIZE
    setTimeout(() => {
      resolve(Array.from({ length: Math.min(PAGE_SIZE, TOTAL - start) }, (_, i) => `Item ${start + i + 1}`))
    }, 500)
  })

export default function Page() {
  const [disabled, setDisabled] = createSignal(false)

  const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
    autoReload: true,
    async load({ cursor }) {
      const page = cursor ? Number(cursor) : 1
      const items = await loadPage(page)
      return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
    },
  })
  const list = createMemo(() => asyncList.connect(listService))

  const service = useMachine(infiniteScroll.machine, () => ({
    id: createUniqueId(),
    disabled: disabled(),
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const api = createMemo(() => infiniteScroll.connect(service, normalizeProps))

  return (
    <>
      <main class="infinite-scroll">
        <h1>Infinite Scroll — Keyboard reachable trigger</h1>
        <p>
          Auto-loads on scroll, and stays reachable by keyboard. Loaded {list().items.length} / {TOTAL}
        </p>
        <label>
          <input type="checkbox" checked={disabled()} onChange={(e) => setDisabled(e.currentTarget.checked)} />
          Disable auto-loading
        </label>
        <div class="scroller" tabIndex={0}>
          <ul>
            <For each={list().items}>{(item) => <li>{item}</li>}</For>
          </ul>
          <div {...api().getSentinelProps()} />
          <div class="footer">
            <Show when={api().hasMore} fallback={<span>End of list</span>}>
              <button type="button" onClick={() => api().loadMore()} disabled={api().loading}>
                {api().loading ? "Loading…" : "Load more"}
              </button>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
