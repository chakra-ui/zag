import { useWindowVirtualizer as useTanStackWindowVirtualizer } from "@tanstack/react-virtual"
import { WindowVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import { ClientOnly } from "../../components/client-only"

const ITEM_COUNT = 10_000
const ITEM_HEIGHT = 80

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}))

/**
 * Override the shared layout CSS that blocks window scrolling.
 * Restores original styles on unmount.
 */
function useWindowScrollOverride() {
  useEffect(() => {
    const body = document.body
    const page = document.querySelector<HTMLElement>(".page")

    const origBody = body.style.overflow
    const origPageOverflow = page?.style.overflow ?? ""
    const origPageHeight = page?.style.height ?? ""

    body.style.overflow = "auto"
    if (page) {
      page.style.overflow = "visible"
      page.style.height = "auto"
    }

    return () => {
      body.style.overflow = origBody
      if (page) {
        page.style.overflow = origPageOverflow
        page.style.height = origPageHeight
      }
    }
  }, [])
}

// =============================================
// Zag WindowVirtualizer
// =============================================

function ZagWindowVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const [virtualizer] = useState(
    () =>
      new WindowVirtualizer({
        count: ITEM_COUNT,
        estimatedSize: () => ITEM_HEIGHT,
        overscan: 5,
        initialSize: typeof window !== "undefined" ? window.innerHeight : 800,
      }),
  )

  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div>
      <h3 style={{ color: "#3b82f6" }}>@zag-js/virtualizer (Window)</h3>
      <BenchmarkButtons onRun={(scrollCount) => runWindowScrollBenchmark(scrollCount, onMetrics)} />
      <div
        ref={ref}
        style={{
          ...virtualizer.getContainerStyle(),
          width: "100%",
          border: "2px solid #3b82f6",
          borderRadius: 8,
        }}
      >
        <div style={{ height: totalSize, width: "100%", position: "relative" }}>
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
              <strong>{items[vi.index].label}</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>{items[vi.index].description}</div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Rendered: {virtualItems.length} items</p>
    </div>
  )
}

// =============================================
// TanStack WindowVirtualizer
// =============================================

function TanStackWindowVirtualizer({ onMetrics }: { onMetrics: (m: Metrics) => void }) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const listOffsetRef = useRef(0)

  useLayoutEffect(() => {
    listOffsetRef.current = listRef.current?.offsetTop ?? 0
  }, [])

  const virtualizer = useTanStackWindowVirtualizer({
    count: ITEM_COUNT,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
    scrollMargin: listOffsetRef.current,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div>
      <h3 style={{ color: "#f97316" }}>@tanstack/react-virtual (Window)</h3>
      <BenchmarkButtons onRun={(scrollCount) => runWindowScrollBenchmark(scrollCount, onMetrics)} />
      <div
        ref={listRef}
        style={{
          width: "100%",
          border: "2px solid #f97316",
          borderRadius: 8,
        }}
      >
        <div style={{ height: totalSize, width: "100%", position: "relative" }}>
          {virtualItems.map((vi) => (
            <div
              key={vi.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: vi.size,
                transform: `translateY(${vi.start - virtualizer.options.scrollMargin}px)`,
                padding: "8px 12px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: vi.index % 2 === 0 ? "#f8fafc" : "#fff",
              }}
            >
              <strong>{items[vi.index].label}</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>{items[vi.index].description}</div>
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
// Sticky header for metrics (stays visible while scrolling)
// =============================================

function StickyHeader({
  activeView,
  setActiveView,
  zagMetrics,
  tanstackMetrics,
}: {
  activeView: ActiveView
  setActiveView: (v: ActiveView) => void
  zagMetrics: Metrics | null
  tanstackMetrics: Metrics | null
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 0",
        marginBottom: 16,
      }}
    >
      <h1 style={{ margin: "0 0 8px 0", fontSize: 22 }}>Window Virtualizer — Perf Comparison</h1>
      <p style={{ color: "#64748b", margin: "0 0 12px 0", fontSize: 13 }}>
        {ITEM_COUNT.toLocaleString()} items, {ITEM_HEIGHT}px estimated height, 5 overscan. Both virtualizers scroll{" "}
        <code>window</code>. Switch tabs then run a benchmark.
      </p>

      <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
        <button
          onClick={() => setActiveView("zag")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px 0 0 6px",
            cursor: "pointer",
            border: "2px solid #3b82f6",
            backgroundColor: activeView === "zag" ? "#3b82f6" : "#fff",
            color: activeView === "zag" ? "#fff" : "#3b82f6",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          @zag-js/virtualizer
        </button>
        <button
          onClick={() => setActiveView("tanstack")}
          style={{
            padding: "8px 16px",
            borderRadius: "0 6px 6px 0",
            cursor: "pointer",
            border: "2px solid #f97316",
            borderLeft: "none",
            backgroundColor: activeView === "tanstack" ? "#f97316" : "#fff",
            color: activeView === "tanstack" ? "#fff" : "#f97316",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          @tanstack/react-virtual
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <MetricsDisplay label="@zag-js/virtualizer" metrics={zagMetrics} />
        <MetricsDisplay label="@tanstack/react-virtual" metrics={tanstackMetrics} />
      </div>

      {zagMetrics && tanstackMetrics && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: "#ecfdf5",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <strong>Comparison:</strong>{" "}
          <span>
            Avg frame: Zag {zagMetrics.avgFrameTime}ms vs TanStack {tanstackMetrics.avgFrameTime}ms (
            {zagMetrics.avgFrameTime < tanstackMetrics.avgFrameTime ? "Zag wins" : "TanStack wins"} by{" "}
            {Math.abs(Math.round((1 - zagMetrics.avgFrameTime / tanstackMetrics.avgFrameTime) * 100))}%) | Dropped: Zag{" "}
            {zagMetrics.droppedFrames} vs TanStack {tanstackMetrics.droppedFrames}
          </span>
        </div>
      )}
    </div>
  )
}

// =============================================
// Page
// =============================================

type ActiveView = "zag" | "tanstack"

function PerfContent() {
  useWindowScrollOverride()

  const [activeView, setActiveView] = useState<ActiveView>("zag")
  const [zagMetrics, setZagMetrics] = useState<Metrics | null>(null)
  const [tanstackMetrics, setTanstackMetrics] = useState<Metrics | null>(null)

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>
      <StickyHeader
        activeView={activeView}
        setActiveView={setActiveView}
        zagMetrics={zagMetrics}
        tanstackMetrics={tanstackMetrics}
      />

      {activeView === "zag" ? (
        <ZagWindowVirtualizer onMetrics={setZagMetrics} />
      ) : (
        <TanStackWindowVirtualizer onMetrics={setTanstackMetrics} />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <ClientOnly fallback={<div style={{ padding: 20, color: "#6b7280" }}>Loading…</div>}>
      <PerfContent />
    </ClientOnly>
  )
}
