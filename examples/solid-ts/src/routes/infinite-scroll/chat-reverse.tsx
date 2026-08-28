import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 15
const TOTAL = 75

const loadOlder = (page: number): Promise<string[]> =>
  new Promise((resolve) => {
    const end = TOTAL - (page - 1) * PAGE_SIZE
    setTimeout(() => {
      resolve(Array.from({ length: PAGE_SIZE }, (_, i) => `Message ${end - i}`))
    }, 600)
  })

export default function Page() {
  // `async-list` appends each page, so pages arrive newest-first. Rendering the list
  // reversed puts the oldest message at the top, which is what a thread looks like.
  const listService = useMachine(asyncList.machine as asyncList.Machine<string>, {
    autoReload: true,
    async load({ cursor }) {
      const page = cursor ? Number(cursor) : 1
      const items = await loadOlder(page)
      return { items, cursor: page * PAGE_SIZE < TOTAL ? String(page + 1) : undefined }
    },
  })
  const list = createMemo(() => asyncList.connect(listService))

  const service = useMachine(infiniteScroll.machine, () => ({
    id: createUniqueId(),
    edge: "start" as const,
    count: list().items.length,
    hasMore: list().hasMore,
    loading: list().isLoading,
    onLoadMore: () => list().loadMore(),
  }))

  const api = createMemo(() => infiniteScroll.connect(service, normalizeProps))

  return (
    <>
      <main class="infinite-scroll">
        <h1>Infinite Scroll — Chat (reversed)</h1>
        <p>Scroll up to load older messages ({list().items.length} loaded)</p>
        <div class="scroller" tabIndex={0}>
          <div {...api().getSentinelProps()} />
          <div {...api().getIndicatorProps({ type: "loading" })}>Loading older messages…</div>
          <div {...api().getIndicatorProps({ type: "complete" })}>Beginning of conversation</div>
          <ul>
            <For each={[...list().items].reverse()}>{(message) => <li>{message}</li>}</For>
          </ul>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
