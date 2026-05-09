"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useWaterfallVirtualizer } from "@/hooks/use-virtualizer"

const DEFAULT_ITEM_COUNT = 5_000
const OVERSCAN = 6
const VIEWPORT_HEIGHT = 460
const COLUMN_GAP = 12
const ROW_GAP = 12
const ESTIMATED_CARD_HEIGHT = 210

const ITEM_COUNT_OPTIONS = [2_000, 5_000, 10_000] as const
const COLUMN_COUNT_OPTIONS = [2, 3, 4, 5] as const
const BENCHMARK_SCROLLS = [200, 500, 1000] as const

type WaterfallItem = {
  id: string
  title: string
  subtitle: string
  height: number
  lines: number
}

interface RuntimeStats {
  renderedCount: number
  visibleCount: number
  overscanCount: number
  totalSize: number
}

interface Metrics extends RuntimeStats {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

type BenchmarkRunner = (scrollCount: number) => Promise<Metrics>
type RunOrder = "zag-then-tanstack" | "tanstack-then-zag"

const RUN_ORDER_OPTIONS: Array<{ label: string; value: RunOrder }> = [
  { label: "Run Zag then TanStack", value: "zag-then-tanstack" },
  { label: "Run TanStack then Zag", value: "tanstack-then-zag" },
]
const RUN_COOLDOWN_MS = 150

function createFallbackMetrics(scrollCount: number, runtime: RuntimeStats): Metrics {
  return {
    totalTime: 0,
    scrollCount,
    avgFrameTime: 0,
    minFrameTime: 0,
    maxFrameTime: 0,
    droppedFrames: 0,
    renderedCount: runtime.renderedCount,
    visibleCount: runtime.visibleCount,
    overscanCount: runtime.overscanCount,
    totalSize: Math.round(runtime.totalSize),
  }
}

function getItemHeight(index: number): number {
  const hash = ((index * 1103515245 + 12345) >>> 0) % 170
  return 120 + hash
}

function buildItems(itemCount: number): WaterfallItem[] {
  return Array.from({ length: itemCount }, (_, index) => {
    const height = getItemHeight(index)
    return {
      id: `waterfall-item-${index}`,
      title: `Card ${index + 1}`,
      subtitle: `Score ${(index * 37) % 100}`,
      height,
      lines: 2 + (index % 5),
    }
  })
}

function runScrollBenchmark(scrollEl: HTMLElement, scrollCount: number, getRuntimeStats: () => RuntimeStats) {
  return new Promise<Metrics>((resolve) => {
    const frameTimes: number[] = []
    let lastTime = performance.now()
    let scrollsDone = 0
    const maxScrollable = scrollEl.scrollHeight - scrollEl.clientHeight
    if (maxScrollable <= 0) {
      resolve(createFallbackMetrics(scrollCount, getRuntimeStats()))
      return
    }
    const scrollStep = maxScrollable / scrollCount

    function tick() {
      const now = performance.now()
      frameTimes.push(now - lastTime)
      lastTime = now

      if (scrollsDone < scrollCount) {
        scrollEl.scrollTop = scrollStep * scrollsDone
        scrollsDone++
        requestAnimationFrame(tick)
        return
      }

      scrollEl.scrollTop = 0
      const totalTime = frameTimes.reduce((sum, value) => sum + value, 0)
      const runtime = getRuntimeStats()
      resolve({
        totalTime: Math.round(totalTime),
        scrollCount,
        avgFrameTime: Math.round((totalTime / frameTimes.length) * 100) / 100,
        minFrameTime: Math.round(Math.min(...frameTimes) * 100) / 100,
        maxFrameTime: Math.round(Math.max(...frameTimes) * 100) / 100,
        droppedFrames: frameTimes.filter((time) => time > 16.67).length,
        renderedCount: runtime.renderedCount,
        visibleCount: runtime.visibleCount,
        overscanCount: runtime.overscanCount,
        totalSize: Math.round(runtime.totalSize),
      })
    }

    requestAnimationFrame(tick)
  })
}

function BenchmarkControls({
  itemCount,
  columnCount,
  runOrder,
  runStatus,
  isRunning,
  onItemCountChange,
  onColumnCountChange,
  onRunOrderChange,
  onRun,
  onClear,
}: {
  itemCount: number
  columnCount: number
  runOrder: RunOrder
  runStatus: string
  isRunning: boolean
  onItemCountChange: (value: number) => void
  onColumnCountChange: (value: number) => void
  onRunOrderChange: (value: RunOrder) => void
  onRun: (scrollCount: number) => void
  onClear: () => void
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        padding: 12,
        marginTop: 14,
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
      }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Items
        <select
          value={itemCount}
          onChange={(event) => onItemCountChange(Number(event.currentTarget.value))}
          style={{ padding: "4px 6px", borderRadius: 4 }}
        >
          {ITEM_COUNT_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString()}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Columns
        <select
          value={columnCount}
          onChange={(event) => onColumnCountChange(Number(event.currentTarget.value))}
          style={{ padding: "4px 6px", borderRadius: 4 }}
        >
          {COLUMN_COUNT_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Run order
        <select
          value={runOrder}
          onChange={(event) => onRunOrderChange(event.currentTarget.value as RunOrder)}
          disabled={isRunning}
          style={{ padding: "4px 6px", borderRadius: 4 }}
        >
          {RUN_ORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {BENCHMARK_SCROLLS.map((scrollCount) => (
        <button
          key={scrollCount}
          onClick={() => onRun(scrollCount)}
          disabled={isRunning}
          style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
        >
          Run {scrollCount}
        </button>
      ))}

      <button onClick={onClear} style={{ padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
        Clear metrics
      </button>
      <span style={{ fontSize: 13, color: "#475569" }}>{runStatus}</span>
    </div>
  )
}

function Card({ item, width }: { item: WaterfallItem; width: number }) {
  return (
    <article
      style={{
        boxSizing: "border-box",
        height: item.height,
        width,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background:
          "linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)",
      }}
    >
      <strong style={{ fontSize: 13 }}>{item.title}</strong>
      <p style={{ margin: "4px 0 8px", fontSize: 12, color: "#64748b" }}>{item.subtitle}</p>
      <div style={{ display: "grid", gap: 6 }}>
        {Array.from({ length: item.lines }, (_, lineIndex) => (
          <div
            key={lineIndex}
            style={{
              width: `${55 + ((lineIndex * 17 + item.lines * 9) % 40)}%`,
              height: 8,
              borderRadius: 99,
              backgroundColor: "#cbd5e1",
            }}
          />
        ))}
      </div>
    </article>
  )
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
        <div>
          Rendered/visible/overscan: {metrics.renderedCount}/{metrics.visibleCount}/{metrics.overscanCount}
        </div>
        <div>Total virtual size: {metrics.totalSize}px</div>
      </div>
    </div>
  )
}

function ZagWaterfall({
  items,
  columnCount,
  registerBenchmarkRunner,
}: {
  items: WaterfallItem[]
  columnCount: number
  registerBenchmarkRunner: (runner: BenchmarkRunner | null) => void
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { virtualizer, ref } = useWaterfallVirtualizer({
    count: items.length,
    columnCount,
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    overscan: OVERSCAN,
    estimatedSize: () => ESTIMATED_CARD_HEIGHT,
  })

  virtualizer.updateOptions({
    count: items.length,
    columnCount,
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    overscan: OVERSCAN,
    estimatedSize: () => ESTIMATED_CARD_HEIGHT,
  })

  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element
      ref(element)
    },
    [ref],
  )

  const virtualItems = virtualizer.getVirtualItems()
  const layout = virtualizer.getWaterfallState()

  const getRuntimeStats = useCallback((): RuntimeStats => {
    const visibleCount = virtualItems.filter((item) => item.isVisible).length
    const overscanCount = virtualItems.length - visibleCount
    return {
      renderedCount: virtualItems.length,
      visibleCount,
      overscanCount,
      totalSize: virtualizer.getTotalSize(),
    }
  }, [virtualItems, virtualizer])

  const runBenchmark = useCallback(
    (scrollCount: number) => {
      const element = scrollRef.current
      if (!element) return Promise.resolve(createFallbackMetrics(scrollCount, getRuntimeStats()))
      return runScrollBenchmark(element, scrollCount, getRuntimeStats)
    },
    [getRuntimeStats],
  )

  useEffect(() => {
    registerBenchmarkRunner(runBenchmark)
    return () => registerBenchmarkRunner(null)
  }, [registerBenchmarkRunner, runBenchmark])

  return (
    <section>
      <h2 style={{ color: "#3b82f6" }}>@zag-js/virtualizer — WaterfallVirtualizer</h2>
      <div
        ref={setRef}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Zag waterfall performance list"
        style={{ height: VIEWPORT_HEIGHT, overflow: "auto", border: "2px solid #3b82f6", borderRadius: 8 }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualItems.map((vi) => {
            const item = items[vi.index]
            if (!item) return null
            return (
              <div key={item.id} ref={vi.measureElement} style={virtualizer.getItemStyle(vi)}>
                <Card item={item} width={layout.columnWidth} />
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
        Rendered: {virtualItems.length} items • Columns: {layout.columnCount} • Column width:{" "}
        {Math.round(layout.columnWidth)}px
      </p>
    </section>
  )
}

function TanStackWaterfall({
  items,
  columnCount,
  registerBenchmarkRunner,
}: {
  items: WaterfallItem[]
  columnCount: number
  registerBenchmarkRunner: (runner: BenchmarkRunner | null) => void
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const updateWidth = () => setContainerWidth(element.clientWidth)
    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    gap: ROW_GAP,
    lanes: columnCount,
    overscan: OVERSCAN,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const columnWidth = Math.max(1, (containerWidth - (columnCount - 1) * COLUMN_GAP) / columnCount)

  const getRuntimeStats = useCallback((): RuntimeStats => {
    const element = scrollRef.current
    const viewportStart = element?.scrollTop ?? 0
    const viewportEnd = viewportStart + (element?.clientHeight ?? 0)
    const visibleCount = virtualItems.filter((item) => item.end > viewportStart && item.start < viewportEnd).length
    return {
      renderedCount: virtualItems.length,
      visibleCount,
      overscanCount: virtualItems.length - visibleCount,
      totalSize: virtualizer.getTotalSize(),
    }
  }, [virtualItems, virtualizer])

  const runBenchmark = useCallback(
    (scrollCount: number) => {
      const element = scrollRef.current
      if (!element) return Promise.resolve(createFallbackMetrics(scrollCount, getRuntimeStats()))
      return runScrollBenchmark(element, scrollCount, getRuntimeStats)
    },
    [getRuntimeStats],
  )

  useEffect(() => {
    registerBenchmarkRunner(runBenchmark)
    return () => registerBenchmarkRunner(null)
  }, [registerBenchmarkRunner, runBenchmark])

  return (
    <section>
      <h2 style={{ color: "#f97316" }}>@tanstack/react-virtual — masonry lanes</h2>
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="TanStack waterfall performance list"
        style={{ height: VIEWPORT_HEIGHT, overflow: "auto", border: "2px solid #f97316", borderRadius: 8 }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualItems.map((vi) => {
            const item = items[vi.index]
            if (!item) return null
            const lane = vi.lane ?? vi.index % columnCount
            const left = lane * (columnWidth + COLUMN_GAP)
            return (
              <div
                key={item.id}
                ref={virtualizer.measureElement}
                data-index={vi.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translate3d(${left}px, ${vi.start}px, 0)`,
                  width: columnWidth,
                }}
              >
                <Card item={item} width={columnWidth} />
              </div>
            )
          })}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
        Rendered: {virtualItems.length} items • Columns: {columnCount} • Column width: {Math.round(columnWidth)}px
      </p>
    </section>
  )
}

export default function Page() {
  const [itemCount, setItemCount] = useState<number>(DEFAULT_ITEM_COUNT)
  const [columnCount, setColumnCount] = useState<number>(4)
  const [runOrder, setRunOrder] = useState<RunOrder>("zag-then-tanstack")
  const [isRunning, setIsRunning] = useState(false)
  const [runStatus, setRunStatus] = useState("Idle")
  const [zagMetrics, setZagMetrics] = useState<Metrics | null>(null)
  const [tanstackMetrics, setTanstackMetrics] = useState<Metrics | null>(null)

  const items = useMemo(() => buildItems(itemCount), [itemCount])

  const zagRunnerRef = useRef<BenchmarkRunner | null>(null)
  const tanstackRunnerRef = useRef<BenchmarkRunner | null>(null)
  const runLockRef = useRef(false)
  const registerZagRunner = useCallback((runner: BenchmarkRunner | null) => {
    zagRunnerRef.current = runner
  }, [])
  const registerTanStackRunner = useCallback((runner: BenchmarkRunner | null) => {
    tanstackRunnerRef.current = runner
  }, [])

  const clearMetrics = useCallback(() => {
    setZagMetrics(null)
    setTanstackMetrics(null)
    setRunStatus("Idle")
  }, [])

  useEffect(() => {
    clearMetrics()
  }, [clearMetrics, itemCount, columnCount])

  const runBenchmark = useCallback(
    async (scrollCount: number) => {
      if (runLockRef.current) return
      const runZag = zagRunnerRef.current
      const runTanStack = tanstackRunnerRef.current
      if (!runZag || !runTanStack) return

      runLockRef.current = true
      setIsRunning(true)
      try {
        const order =
          runOrder === "zag-then-tanstack"
            ? [
                { id: "zag", label: "Zag", run: runZag },
                { id: "tanstack", label: "TanStack", run: runTanStack },
              ]
            : [
                { id: "tanstack", label: "TanStack", run: runTanStack },
                { id: "zag", label: "Zag", run: runZag },
              ]

        setRunStatus(`Running ${order[0].label} (1/2)...`)
        const firstMetrics = await order[0].run(scrollCount)
        if (order[0].id === "zag") setZagMetrics(firstMetrics)
        else setTanstackMetrics(firstMetrics)

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, RUN_COOLDOWN_MS)
        })

        setRunStatus(`Running ${order[1].label} (2/2)...`)
        const secondMetrics = await order[1].run(scrollCount)
        if (order[1].id === "zag") setZagMetrics(secondMetrics)
        else setTanstackMetrics(secondMetrics)

        setRunStatus(
          `Completed ${scrollCount} scrolls (${order[0].label} → ${order[1].label}, ${RUN_COOLDOWN_MS}ms cooldown)`,
        )
      } finally {
        runLockRef.current = false
        setIsRunning(false)
      }
    },
    [runOrder],
  )

  return (
    <main style={{ padding: 20, maxWidth: 1320, margin: "0 auto" }}>
      <h1>Waterfall Virtualizer Perf Comparison</h1>
      <p style={{ color: "#64748b" }}>
        Benchmark Zag <code>WaterfallVirtualizer</code> against TanStack virtual lanes using variable-height cards in a
        masonry/waterfall layout. Benchmarks run synchronized scroll loops and report frame timing plus rendered runtime
        stats.
      </p>
      <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
        Benchmarks run sequentially (never concurrently) to keep each implementation isolated.
      </p>

      <BenchmarkControls
        itemCount={itemCount}
        columnCount={columnCount}
        runOrder={runOrder}
        runStatus={runStatus}
        isRunning={isRunning}
        onItemCountChange={setItemCount}
        onColumnCountChange={setColumnCount}
        onRunOrderChange={setRunOrder}
        onRun={runBenchmark}
        onClear={clearMetrics}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <ZagWaterfall items={items} columnCount={columnCount} registerBenchmarkRunner={registerZagRunner} />
        <TanStackWaterfall items={items} columnCount={columnCount} registerBenchmarkRunner={registerTanStackRunner} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <MetricsDisplay label="@zag-js/virtualizer" metrics={zagMetrics} />
        <MetricsDisplay label="@tanstack/react-virtual" metrics={tanstackMetrics} />
      </div>

      {zagMetrics && tanstackMetrics && (
        <div style={{ marginTop: 24, padding: 16, backgroundColor: "#ecfdf5", borderRadius: 8, fontSize: 14 }}>
          <strong>Comparison:</strong>
          <div style={{ marginTop: 8 }}>
            Avg frame: Zag {zagMetrics.avgFrameTime}ms vs TanStack {tanstackMetrics.avgFrameTime}ms (
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
