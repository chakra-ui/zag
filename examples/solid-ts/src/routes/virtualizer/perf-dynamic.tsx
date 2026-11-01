import { For, Show, createSignal } from "solid-js"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 100_000

// Deterministic variable heights: 25-125px per item
function getItemHeight(index: number): number {
  const hash = ((index * 2654435761) >>> 0) % 100
  return 25 + Math.round((hash / 100) * 100)
}

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  height: getItemHeight(i),
}))

interface Metrics {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

const buttonStyle = { padding: "6px 12px", "border-radius": "4px", cursor: "pointer" }

function BenchmarkButtons(props: { onRun: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "8px", "margin-bottom": "12px" }}>
      <button onClick={() => props.onRun(200)} style={buttonStyle}>
        200 scrolls
      </button>
      <button onClick={() => props.onRun(500)} style={buttonStyle}>
        500 scrolls
      </button>
      <button onClick={() => props.onRun(1000)} style={buttonStyle}>
        1000 scrolls
      </button>
    </div>
  )
}

function runScrollBenchmark(scrollEl: HTMLElement, scrollCount: number, onComplete: (m: Metrics) => void) {
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
      onComplete({
        totalTime: Math.round(totalTime),
        scrollCount,
        avgFrameTime: Math.round((totalTime / frameTimes.length) * 100) / 100,
        minFrameTime: Math.round(Math.min(...frameTimes) * 100) / 100,
        maxFrameTime: Math.round(Math.max(...frameTimes) * 100) / 100,
        droppedFrames: frameTimes.filter((t) => t > 16.67).length,
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

function ZagVirtualizer(props: { onMetrics: (m: Metrics) => void }) {
  let scrollEl: HTMLDivElement | undefined

  const { virtualizer, ref } = useListVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: (i) => getItemHeight(i),
    overscan: 5,
  })

  return (
    <div>
      <h2 style={{ color: "#3b82f6" }}>@zag-js/virtualizer</h2>
      <BenchmarkButtons
        onRun={(n) => {
          if (scrollEl) runScrollBenchmark(scrollEl, n, props.onMetrics)
        }}
      />
      <div
        ref={(el) => {
          scrollEl = el
          ref(el)
        }}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Zag known-size performance list"
        style={{ height: "400px", overflow: "auto", border: "2px solid #3b82f6", "border-radius": "8px" }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <For each={virtualizer.getVirtualItems()}>
            {(vi) => {
              const item = items[vi.index]
              return (
                <div
                  style={{
                    ...virtualizer.getItemStyle(vi),
                    height: `${item.height}px`,
                    padding: "8px 12px",
                    "border-bottom": "1px solid #e5e7eb",
                    "background-color": vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                    display: "flex",
                    "align-items": "center",
                  }}
                >
                  {item.label}{" "}
                  <span style={{ color: "#9ca3af", "font-size": "12px", "margin-left": "8px" }}>({item.height}px)</span>
                </div>
              )
            }}
          </For>
        </div>
      </div>
      <p style={{ "font-size": "13px", color: "#64748b", "margin-top": "8px" }}>
        Rendered: {virtualizer.getVirtualItems().length} items
      </p>
    </div>
  )
}

export default function Page() {
  const [metrics, setMetrics] = createSignal<Metrics | null>(null)

  return (
    <main style={{ padding: "20px", "max-width": "1200px", margin: "0 auto" }}>
      <h1>Variable Heights Perf (Known Sizes)</h1>
      <p style={{ color: "#64748b" }}>
        {ITEM_COUNT.toLocaleString()} items with <strong>known variable heights (25-125px)</strong>. Uses{" "}
        <code>estimatedSize: (i) =&gt; getItemHeight(i)</code> — exact per-item size upfront, no measureElement. Tests
        pure scroll + range-finding perf with variable-size prefix sums.
      </p>

      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "24px", "margin-top": "24px" }}>
        <ZagVirtualizer onMetrics={setMetrics} />
        <MetricsDisplay label="@zag-js/virtualizer" metrics={metrics()} />
      </div>
    </main>
  )
}
