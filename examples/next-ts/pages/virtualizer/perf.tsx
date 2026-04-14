import { useVirtualizer } from "@tanstack/react-virtual"
import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

const ITEM_COUNT = 100_000
const ITEM_HEIGHT = 40

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

// =============================================
// Zag Virtualizer
// =============================================

function ZagVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [virtualizer] = useState(
    () =>
      new ListVirtualizer({
        count: ITEM_COUNT,
        estimatedSize: () => ITEM_HEIGHT,
        overscan: 5,
      }),
  )

  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      scrollRef.current = el
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div>
      <h3>@zag-js/virtualizer</h3>
      <BenchmarkButtons
        onRun={(scrollCount) => {
          const el = scrollRef.current
          if (!el) return
          runScrollBenchmark(el, scrollCount, onMetrics)
        }}
      />
      <div
        ref={setRef}
        onScroll={virtualizer.handleScroll}
        style={{
          height: 400,
          overflow: "auto",
          border: "2px solid #3b82f6",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((vi) => (
            <div
              key={vi.index}
              style={{
                ...virtualizer.getItemStyle(vi),
                padding: "8px 12px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
              }}
            >
              {items[vi.index].label}
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Rendered: {virtualItems.length} items</p>
    </div>
  )
}

// =============================================
// TanStack Virtual
// =============================================

function TanStackVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const virtualizer = useVirtualizer({
    count: ITEM_COUNT,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div>
      <h3>@tanstack/react-virtual</h3>
      <BenchmarkButtons
        onRun={(scrollCount) => {
          const el = scrollRef.current
          if (!el) return
          runScrollBenchmark(el, scrollCount, onMetrics)
        }}
      />
      <div
        ref={scrollRef}
        style={{
          height: 400,
          overflow: "auto",
          border: "2px solid #f97316",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((vi) => (
            <div
              key={vi.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
                padding: "8px 12px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
              }}
            >
              {items[vi.index].label}
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Rendered: {virtualItems.length} items</p>
    </div>
  )
}

// =============================================
// Benchmark Utilities
// =============================================

interface Metrics {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

function BenchmarkButtons({ onRun }: { onRun: (scrollCount: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button onClick={() => onRun(100)} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
        100 scrolls
      </button>
      <button onClick={() => onRun(500)} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
        500 scrolls
      </button>
      <button onClick={() => onRun(1000)} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
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
      // Scroll back to top
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

function MetricsDisplay({ label, metrics }: { label: string; metrics: Metrics | null }) {
  if (!metrics) return null
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: "monospace",
      }}
    >
      <strong>{label}</strong> ({metrics.scrollCount} scrolls)
      <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
        <div>Total time: {metrics.totalTime}ms</div>
        <div>Avg frame: {metrics.avgFrameTime}ms</div>
        <div>Min frame: {metrics.minFrameTime}ms</div>
        <div>Max frame: {metrics.maxFrameTime}ms</div>
        <div style={{ color: metrics.droppedFrames > 10 ? "#dc2626" : "#16a34a" }}>
          Dropped frames (&gt;16.67ms): {metrics.droppedFrames} / {metrics.scrollCount}
        </div>
      </div>
    </div>
  )
}

// =============================================
// Page
// =============================================

export default function Page() {
  const [zagMetrics, setZagMetrics] = useState<Metrics | null>(null)
  const [tanstackMetrics, setTanstackMetrics] = useState<Metrics | null>(null)

  return (
    <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Virtualizer Performance Comparison</h1>
      <p style={{ color: "#64748b" }}>
        {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px fixed height, 5 overscan. Click a scroll count button to
        run the benchmark.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <ZagVirtualizer onMetrics={setZagMetrics} />
        <TanStackVirtualizer onMetrics={setTanstackMetrics} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <MetricsDisplay label="@zag-js/virtualizer" metrics={zagMetrics} />
        <MetricsDisplay label="@tanstack/react-virtual" metrics={tanstackMetrics} />
      </div>

      {zagMetrics && tanstackMetrics && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#ecfdf5",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <strong>Comparison:</strong>
          <div style={{ marginTop: 8 }}>
            Avg frame time: Zag {zagMetrics.avgFrameTime}ms vs TanStack {tanstackMetrics.avgFrameTime}ms (
            {zagMetrics.avgFrameTime < tanstackMetrics.avgFrameTime ? "Zag wins" : "TanStack wins"} by{" "}
            {Math.abs(Math.round((1 - zagMetrics.avgFrameTime / tanstackMetrics.avgFrameTime) * 100))}
            %)
          </div>
          <div>
            Dropped frames: Zag {zagMetrics.droppedFrames} vs TanStack {tanstackMetrics.droppedFrames}
          </div>
        </div>
      )}
    </main>
  )
}
