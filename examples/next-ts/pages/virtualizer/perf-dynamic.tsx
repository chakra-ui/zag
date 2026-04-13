import { useVirtualizer } from "@tanstack/react-virtual"
import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { flushSync } from "react-dom"

const ITEM_COUNT = 100_000

// Deterministic variable heights: 25-125px per item (matches TanStack docs pattern)
function getItemHeight(index: number): number {
  const hash = ((index * 2654435761) >>> 0) % 100
  return 25 + Math.round((hash / 100) * 100)
}

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  height: getItemHeight(i),
}))

// =============================================
// Shared
// =============================================

interface Metrics {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

function BenchmarkButtons({ onRun }: { onRun: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button onClick={() => onRun(200)} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
        200 scrolls
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

function MetricsDisplay({ label, metrics }: { label: string; metrics: Metrics | null }) {
  if (!metrics) return null
  return (
    <div style={{ padding: 16, backgroundColor: "#f1f5f9", borderRadius: 8, fontSize: 14, fontFamily: "monospace" }}>
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
// Zag Virtualizer — known variable sizes via estimateSize
// =============================================

function ZagVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [, rerender] = useReducer(() => ({}), {})

  const [virtualizer] = useState(
    () =>
      new ListVirtualizer({
        count: ITEM_COUNT,
        estimatedSize: (i) => getItemHeight(i),
        overscan: 5,
        onRangeChange() {
          flushSync(rerender)
        },
      }),
  )

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      ;(scrollRef as any).current = el
      virtualizer.init(el)
      rerender()
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div>
      <h3 style={{ color: "#3b82f6" }}>@zag-js/virtualizer</h3>
      <BenchmarkButtons
        onRun={(n) => {
          if (scrollRef.current) runScrollBenchmark(scrollRef.current, n, onMetrics)
        }}
      />
      <div
        ref={setRef}
        onScroll={virtualizer.handleScroll}
        style={{ height: 400, overflow: "auto", border: "2px solid #3b82f6", borderRadius: 8 }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualItems.map((vi) => {
            const item = items[vi.index]
            return (
              <div
                key={vi.index}
                style={{
                  ...virtualizer.getItemStyle(vi),
                  height: item.height,
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.label} <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>({item.height}px)</span>
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Rendered: {virtualItems.length} items</p>
    </div>
  )
}

// =============================================
// TanStack Virtual — known variable sizes via estimateSize (TanStack docs pattern)
// =============================================

function TanStackVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: ITEM_COUNT,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => getItemHeight(i),
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div>
      <h3 style={{ color: "#f97316" }}>@tanstack/react-virtual</h3>
      <BenchmarkButtons
        onRun={(n) => {
          if (scrollRef.current) runScrollBenchmark(scrollRef.current, n, onMetrics)
        }}
      />
      <div ref={scrollRef} style={{ height: 400, overflow: "auto", border: "2px solid #f97316", borderRadius: 8 }}>
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualItems.map((vi) => {
            const item = items[vi.index]
            return (
              <div
                key={vi.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: item.height,
                  transform: `translateY(${vi.start}px)`,
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.label} <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 8 }}>({item.height}px)</span>
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Rendered: {virtualItems.length} items</p>
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
      <h1>Variable Heights Perf (Known Sizes)</h1>
      <p style={{ color: "#64748b" }}>
        {ITEM_COUNT.toLocaleString()} items with <strong>known variable heights (25-125px)</strong>. Both use{" "}
        <code>estimateSize: (i) =&gt; getItemHeight(i)</code> — exact per-item size upfront, no measureElement. Tests
        pure scroll + range-finding perf with variable-size prefix sums (Fenwick tree O(log n) vs linear scan).
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
        <div style={{ marginTop: 24, padding: 16, backgroundColor: "#ecfdf5", borderRadius: 8, fontSize: 14 }}>
          <strong>Comparison:</strong>
          <div style={{ marginTop: 8 }}>
            Avg frame time: Zag {zagMetrics.avgFrameTime}ms vs TanStack {tanstackMetrics.avgFrameTime}ms (
            {zagMetrics.avgFrameTime < tanstackMetrics.avgFrameTime ? "Zag wins" : "TanStack wins"} by{" "}
            {Math.abs(Math.round((1 - zagMetrics.avgFrameTime / tanstackMetrics.avgFrameTime) * 100))}%)
          </div>
          <div>
            Dropped frames: Zag {zagMetrics.droppedFrames} vs TanStack {tanstackMetrics.droppedFrames}
          </div>
        </div>
      )}
    </main>
  )
}
