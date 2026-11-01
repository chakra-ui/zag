import { createSignal, Index, Show } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const ITEM_COUNT = 100_000
const ITEM_HEIGHT = 40

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

interface Metrics {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

function ZagVirtualizer(props: { onMetrics: (m: Metrics) => void }) {
  let scrollEl: HTMLDivElement | null = null

  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  return (
    <div>
      <h2>@zag-js/virtualizer</h2>
      <BenchmarkButtons
        onRun={(scrollCount) => {
          if (!scrollEl) return
          runScrollBenchmark(scrollEl, scrollCount, props.onMetrics)
        }}
      />
      <div
        ref={(el) => {
          scrollEl = el
          ref(el)
        }}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Zag virtualizer performance list"
        style={{
          height: "400px",
          overflow: "auto",
          border: "2px solid #3b82f6",
          "border-radius": "8px",
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <Index each={virtualizer.getVirtualItems()}>
            {(vi) => (
              <div
                style={{
                  ...virtualizer.getItemStyle(vi()),
                  padding: "8px 12px",
                  "border-bottom": "1px solid #e5e7eb",
                  "background-color": vi().index % 2 === 0 ? "#f8fafc" : "#fff",
                }}
              >
                {items[vi().index].label}
              </div>
            )}
          </Index>
        </div>
      </div>
      <p style={{ "font-size": "13px", color: "#64748b", "margin-top": "8px" }}>
        Rendered: {virtualizer.getVirtualItems().length} items
      </p>
    </div>
  )
}

function BenchmarkButtons(props: { onRun: (scrollCount: number) => void }) {
  const style = { padding: "6px 12px", "border-radius": "4px", cursor: "pointer" }
  return (
    <div style={{ display: "flex", gap: "8px", "margin-bottom": "12px" }}>
      <button onClick={() => props.onRun(100)} style={style}>
        100 scrolls
      </button>
      <button onClick={() => props.onRun(500)} style={style}>
        500 scrolls
      </button>
      <button onClick={() => props.onRun(1000)} style={style}>
        1000 scrolls
      </button>
    </div>
  )
}

function runScrollBenchmark(scrollEl: HTMLElement, scrollCount: number, onComplete: (metrics: Metrics) => void) {
  const frameTimes: number[] = []
  let lastTime = performance.now()
  let scrollsDone = 0
  const scrollStep = (scrollEl.scrollHeight - scrollEl.clientHeight) / scrollCount

  function tick() {
    const now = performance.now()
    frameTimes.push(now - lastTime)
    lastTime = now

    if (scrollsDone < scrollCount) {
      scrollEl.scrollTop = scrollStep * scrollsDone
      scrollsDone++
      requestAnimationFrame(tick)
    } else {
      scrollEl.scrollTop = 0

      const totalTime = frameTimes.reduce((a, b) => a + b, 0)
      const avgFrameTime = totalTime / frameTimes.length
      const minFrameTime = Math.min(...frameTimes)
      const maxFrameTime = Math.max(...frameTimes)
      const droppedFrames = frameTimes.filter((t) => t > 16.67).length

      onComplete({
        totalTime: Math.round(totalTime),
        scrollCount,
        avgFrameTime: Math.round(avgFrameTime * 100) / 100,
        minFrameTime: Math.round(minFrameTime * 100) / 100,
        maxFrameTime: Math.round(maxFrameTime * 100) / 100,
        droppedFrames,
      })
    }
  }

  requestAnimationFrame(tick)
}

function MetricsDisplay(props: { label: string; metrics: Metrics | null }) {
  return (
    <Show when={props.metrics}>
      {(metrics) => (
        <div
          style={{
            padding: "16px",
            "background-color": "#f1f5f9",
            "border-radius": "8px",
            "font-size": "14px",
            "font-family": "monospace",
          }}
        >
          <strong>{props.label}</strong> ({metrics().scrollCount} scrolls)
          <div style={{ "margin-top": "8px", display: "grid", gap: "4px" }}>
            <div>Total time: {metrics().totalTime}ms</div>
            <div>Avg frame: {metrics().avgFrameTime}ms</div>
            <div>Min frame: {metrics().minFrameTime}ms</div>
            <div>Max frame: {metrics().maxFrameTime}ms</div>
            <div style={{ color: metrics().droppedFrames > 10 ? "#dc2626" : "#16a34a" }}>
              Dropped frames (&gt;16.67ms): {metrics().droppedFrames} / {metrics().scrollCount}
            </div>
          </div>
        </div>
      )}
    </Show>
  )
}

// Comparison column omitted: no third-party Solid virtualizer is installed
export default function Page() {
  const [zagMetrics, setZagMetrics] = createSignal<Metrics | null>(null)

  return (
    <main style={{ padding: "20px", "max-width": "1200px", margin: "0 auto" }}>
      <h1>Virtualizer Performance</h1>
      <p style={{ color: "#64748b" }}>
        {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px fixed height, 5 overscan. Click a scroll count button to
        run the benchmark.
      </p>

      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "24px", "margin-top": "24px" }}>
        <ZagVirtualizer onMetrics={setZagMetrics} />
      </div>

      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "24px", "margin-top": "24px" }}>
        <MetricsDisplay label="@zag-js/virtualizer" metrics={zagMetrics()} />
      </div>
    </main>
  )
}
