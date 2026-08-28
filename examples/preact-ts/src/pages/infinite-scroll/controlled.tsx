import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/infinite-scroll.css"

const PAGE_SIZE = 15
const TOTAL = 60

export default function Page() {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // `loading` is fully owned by the consumer here — no promise is returned from onLoadMore.
  const service = useMachine(infiniteScroll.machine, {
    id: useId(),
    count: items.length,
    hasMore: items.length < TOTAL,
    loading,
    onLoadMore() {
      setLoading(true)
      setTimeout(() => {
        setItems((prev) => [...prev, ...Array.from({ length: PAGE_SIZE }, (_, i) => `Row ${prev.length + i + 1}`)])
        setLoading(false)
      }, 600)
    },
  })

  const api = infiniteScroll.connect(service, normalizeProps)

  return (
    <>
      <main className="infinite-scroll">
        <h1>Infinite Scroll — Controlled loading</h1>
        <p>{loading ? "Loading…" : `Loaded ${items.length} / ${TOTAL}`}</p>
        <div className="scroller" tabIndex={0}>
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div {...api.getSentinelProps()} />
          <div {...api.getIndicatorProps({ type: "loading" })}>Loading…</div>
          <div {...api.getIndicatorProps({ type: "complete" })}>End of list</div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
