import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 15
const TOTAL = 60

export default function Page() {
  const [items, setItems] = createSignal<string[]>([])
  const [loading, setLoading] = createSignal(false)

  // `loading` is fully owned by the consumer here — no promise is returned from onLoadMore.
  const service = useMachine(infiniteScroll.machine, () => ({
    id: createUniqueId(),
    count: items().length,
    hasMore: items().length < TOTAL,
    loading: loading(),
    onLoadMore() {
      setLoading(true)
      setTimeout(() => {
        setItems((prev) => [...prev, ...Array.from({ length: PAGE_SIZE }, (_, i) => `Row ${prev.length + i + 1}`)])
        setLoading(false)
      }, 600)
    },
  }))

  const api = createMemo(() => infiniteScroll.connect(service, normalizeProps))

  return (
    <>
      <main class="infinite-scroll">
        <h1>Infinite Scroll — Controlled loading</h1>
        <p>{loading() ? "Loading…" : `Loaded ${items().length} / ${TOTAL}`}</p>
        <div class="scroller" tabIndex={0}>
          <ul>
            <For each={items()}>{(item) => <li>{item}</li>}</For>
          </ul>
          <div {...api().getSentinelProps()} />
          <div {...api().getIndicatorProps({ type: "loading" })}>Loading…</div>
          <div {...api().getIndicatorProps({ type: "complete" })}>End of list</div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
