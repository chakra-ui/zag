import { For, Show, createSignal, onMount } from "solid-js"
import { useWindowVirtualizer } from "../../hooks/use-virtualizer"

const ITEM_COUNT = 10_000
const ITEM_HEIGHT = 80

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
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

function BenchmarkButtons(props: { onRun: (scrollCount: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "8px", "margin-bottom": "12px" }}>
      <button onClick={() => props.onRun(100)} style={buttonStyle}>
        100 scrolls
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

function runWindowScrollBenchmark(scrollCount: number, onComplete: (metrics: Metrics) => void) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  if (maxScroll <= 0) return

  const frameTimes: number[] = []
  let lastTime = performance.now()
  let scrollsDone = 0
  const scrollStep = maxScroll / scrollCount

  function tick() {
    const now = performance.now()
    frameTimes.push(now - lastTime)
    lastTime = now

    if (scrollsDone < scrollCount) {
      window.scrollTo(0, scrollStep * scrollsDone)
      scrollsDone++
      requestAnimationFrame(tick)
    } else {
      window.scrollTo(0, 0)
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

function ZagWindowVirtualizer(props: { onMetrics: (m: Metrics) => void }) {
  const { virtualizer, ref } = useWindowVirtualizer({
    count: ITEM_COUNT,
    estimatedSize: () => ITEM_HEIGHT,
    overscan: 5,
    initialRect: { width: window.innerWidth, height: window.innerHeight },
  })

  return (
    <div>
      <h3 style={{ color: "#3b82f6" }}>@zag-js/virtualizer (Window)</h3>
      <BenchmarkButtons onRun={(scrollCount) => runWindowScrollBenchmark(scrollCount, props.onMetrics)} />
      <div
        ref={ref}
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          border: "2px solid #3b82f6",
          "border-radius": "8px",
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <For each={virtualizer.getVirtualItems()}>
            {(vi) => (
              <div
                style={{
                  ...virtualizer.getItemStyle(vi),
                  padding: "8px 12px",
                  "border-bottom": "1px solid #e5e7eb",
                  "background-color": vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                }}
              >
                <strong>{items[vi.index].label}</strong>
                <div style={{ "font-size": "12px", color: "#64748b" }}>{items[vi.index].description}</div>
              </div>
            )}
          </For>
        </div>
      </div>
      <p style={{ "font-size": "13px", color: "#64748b", "margin-top": "8px" }}>
        Rendered: {virtualizer.getVirtualItems().length} items
      </p>
    </div>
  )
}

function StickyHeader(props: { metrics: Metrics | null }) {
  return (
    <div
      style={{
        position: "sticky",
        top: "0",
        "z-index": 100,
        "background-color": "#fff",
        "border-bottom": "1px solid #e5e7eb",
        padding: "16px 0",
        "margin-bottom": "16px",
      }}
    >
      <h1 style={{ margin: "0 0 8px 0", "font-size": "22px" }}>Window Virtualizer — Perf</h1>
      <p style={{ color: "#64748b", margin: "0 0 12px 0", "font-size": "13px" }}>
        {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px estimated height, 5 overscan. Scrolls <code>window</code>.
        Run a benchmark below.
      </p>
      <MetricsDisplay label="@zag-js/virtualizer" metrics={props.metrics} />
    </div>
  )
}

export default function Page() {
  // window virtualizer needs the window rect, so render on the client only
  const [mounted, setMounted] = createSignal(false)
  const [metrics, setMetrics] = createSignal<Metrics | null>(null)
  onMount(() => setMounted(true))

  return (
    <Show when={mounted()} fallback={<div style={{ padding: "20px", color: "#6b7280" }}>Loading…</div>}>
      <div class="window-list-virtualizer" style={{ "max-width": "960px", margin: "0 auto", padding: "0 20px 80px" }}>
        <StickyHeader metrics={metrics()} />
        <ZagWindowVirtualizer onMetrics={setMetrics} />
      </div>
    </Show>
  )
}
