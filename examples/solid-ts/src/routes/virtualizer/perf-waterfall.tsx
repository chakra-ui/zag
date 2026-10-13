import { For, Index, Show, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js"
import { useWaterfallVirtualizer } from "../../hooks/use-virtualizer"

const DEFAULT_ITEM_COUNT = 5_000
const OVERSCAN = 6
const VIEWPORT_HEIGHT = 460
const COLUMN_GAP = 12
const ROW_GAP = 12
const ESTIMATED_CARD_HEIGHT = 210
// stable identity — updateOptions compares by reference
const estimateCardSize = () => ESTIMATED_CARD_HEIGHT

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
  return Array.from({ length: itemCount }, (_, index) => ({
    id: `waterfall-item-${index}`,
    title: `Card ${index + 1}`,
    subtitle: `Score ${(index * 37) % 100}`,
    height: getItemHeight(index),
    lines: 2 + (index % 5),
  }))
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

const buttonStyle = { padding: "6px 12px", "border-radius": "4px", cursor: "pointer" }
const labelStyle = { display: "flex", "align-items": "center", gap: "6px" }
const selectStyle = { padding: "4px 6px", "border-radius": "4px" }

function BenchmarkControls(props: {
  itemCount: number
  columnCount: number
  runStatus: string
  isRunning: boolean
  onItemCountChange: (value: number) => void
  onColumnCountChange: (value: number) => void
  onRun: (scrollCount: number) => void
  onClear: () => void
}) {
  return (
    <div
      style={{
        display: "flex",
        "flex-wrap": "wrap",
        gap: "12px",
        "align-items": "center",
        padding: "12px",
        "margin-top": "14px",
        "border-radius": "8px",
        border: "1px solid #e2e8f0",
        "background-color": "#f8fafc",
      }}
    >
      <label style={labelStyle}>
        Items
        <select
          value={props.itemCount}
          onChange={(event) => props.onItemCountChange(Number(event.currentTarget.value))}
          style={selectStyle}
        >
          <Index each={ITEM_COUNT_OPTIONS}>
            {(value) => <option value={value()}>{value().toLocaleString()}</option>}
          </Index>
        </select>
      </label>

      <label style={labelStyle}>
        Columns
        <select
          value={props.columnCount}
          onChange={(event) => props.onColumnCountChange(Number(event.currentTarget.value))}
          style={selectStyle}
        >
          <Index each={COLUMN_COUNT_OPTIONS}>{(value) => <option value={value()}>{value()}</option>}</Index>
        </select>
      </label>

      <Index each={BENCHMARK_SCROLLS}>
        {(scrollCount) => (
          <button onClick={() => props.onRun(scrollCount())} disabled={props.isRunning} style={buttonStyle}>
            Run {scrollCount()}
          </button>
        )}
      </Index>

      <button onClick={props.onClear} style={buttonStyle}>
        Clear metrics
      </button>
      <span style={{ "font-size": "13px", color: "#475569" }}>{props.runStatus}</span>
    </div>
  )
}

function Card(props: { item: WaterfallItem; width: number }) {
  return (
    <article
      style={{
        "box-sizing": "border-box",
        height: `${props.item.height}px`,
        width: `${props.width}px`,
        padding: "10px 12px",
        "border-radius": "8px",
        border: "1px solid #e2e8f0",
        background:
          "linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)",
      }}
    >
      <strong style={{ "font-size": "13px" }}>{props.item.title}</strong>
      <p style={{ margin: "4px 0 8px", "font-size": "12px", color: "#64748b" }}>{props.item.subtitle}</p>
      <div style={{ display: "grid", gap: "6px" }}>
        <Index each={Array.from({ length: props.item.lines })}>
          {(_, lineIndex) => (
            <div
              style={{
                width: `${55 + ((lineIndex * 17 + props.item.lines * 9) % 40)}%`,
                height: "8px",
                "border-radius": "99px",
                "background-color": "#cbd5e1",
              }}
            />
          )}
        </Index>
      </div>
    </article>
  )
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
            <div>
              Rendered/visible/overscan: {metrics().renderedCount}/{metrics().visibleCount}/{metrics().overscanCount}
            </div>
            <div>Total virtual size: {metrics().totalSize}px</div>
          </div>
        </div>
      )}
    </Show>
  )
}

function ZagWaterfall(props: {
  items: WaterfallItem[]
  columnCount: number
  registerBenchmarkRunner: (runner: ((scrollCount: number) => Promise<Metrics>) | null) => void
}) {
  let scrollEl: HTMLDivElement | undefined
  const { virtualizer, ref } = useWaterfallVirtualizer({
    count: props.items.length,
    columnCount: props.columnCount,
    columnGap: COLUMN_GAP,
    rowGap: ROW_GAP,
    overscan: OVERSCAN,
    estimatedSize: estimateCardSize,
  })

  createEffect(
    on(
      () => [props.items.length, props.columnCount] as const,
      ([count, columnCount]) => virtualizer.updateOptions({ count, columnCount }),
      { defer: true },
    ),
  )

  const getRuntimeStats = (): RuntimeStats => {
    const virtualItems = virtualizer.getVirtualItems()
    const visibleCount = virtualItems.filter((item) => item.isVisible).length
    return {
      renderedCount: virtualItems.length,
      visibleCount,
      overscanCount: virtualItems.length - visibleCount,
      totalSize: virtualizer.getTotalSize(),
    }
  }

  props.registerBenchmarkRunner((scrollCount) => {
    if (!scrollEl) return Promise.resolve(createFallbackMetrics(scrollCount, getRuntimeStats()))
    return runScrollBenchmark(scrollEl, scrollCount, getRuntimeStats)
  })
  onCleanup(() => props.registerBenchmarkRunner(null))

  const layout = () => virtualizer.getWaterfallState()

  return (
    <section>
      <h2 style={{ color: "#3b82f6" }}>@zag-js/virtualizer — WaterfallVirtualizer</h2>
      <div
        ref={(el) => {
          scrollEl = el
          ref(el)
        }}
        onScroll={virtualizer.handleScroll}
        tabIndex={0}
        aria-label="Zag waterfall performance list"
        style={{
          height: `${VIEWPORT_HEIGHT}px`,
          overflow: "auto",
          border: "2px solid #3b82f6",
          "border-radius": "8px",
        }}
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
          <For each={virtualizer.getVirtualItems()}>
            {(vi) => {
              onCleanup(() => vi.measureElement(null))
              return (
                <Show when={props.items[vi.index]}>
                  {(item) => (
                    <div ref={vi.measureElement} style={virtualizer.getItemStyle(vi)}>
                      <Card item={item()} width={layout().columnWidth} />
                    </div>
                  )}
                </Show>
              )
            }}
          </For>
        </div>
      </div>
      <p style={{ "font-size": "13px", color: "#64748b", "margin-top": "8px" }}>
        Rendered: {virtualizer.getVirtualItems().length} items • Columns: {layout().columnCount} • Column width:{" "}
        {Math.round(layout().columnWidth)}px
      </p>
    </section>
  )
}

export default function Page() {
  const [itemCount, setItemCount] = createSignal<number>(DEFAULT_ITEM_COUNT)
  const [columnCount, setColumnCount] = createSignal<number>(4)
  const [isRunning, setIsRunning] = createSignal(false)
  const [runStatus, setRunStatus] = createSignal("Idle")
  const [metrics, setMetrics] = createSignal<Metrics | null>(null)

  const items = createMemo(() => buildItems(itemCount()))

  let runner: ((scrollCount: number) => Promise<Metrics>) | null = null

  const clearMetrics = () => {
    setMetrics(null)
    setRunStatus("Idle")
  }

  createEffect(on([itemCount, columnCount], clearMetrics, { defer: true }))

  const runBenchmark = async (scrollCount: number) => {
    if (isRunning() || !runner) return
    setIsRunning(true)
    try {
      setRunStatus("Running...")
      setMetrics(await runner(scrollCount))
      setRunStatus(`Completed ${scrollCount} scrolls`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <main style={{ padding: "20px", "max-width": "1320px", margin: "0 auto" }}>
      <h1>Waterfall Virtualizer Perf</h1>
      <p style={{ color: "#64748b" }}>
        Benchmark Zag <code>WaterfallVirtualizer</code> using variable-height cards in a masonry/waterfall layout.
        Benchmarks run synchronized scroll loops and report frame timing plus rendered runtime stats.
      </p>

      <BenchmarkControls
        itemCount={itemCount()}
        columnCount={columnCount()}
        runStatus={runStatus()}
        isRunning={isRunning()}
        onItemCountChange={setItemCount}
        onColumnCountChange={setColumnCount}
        onRun={runBenchmark}
        onClear={clearMetrics}
      />

      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "24px", "margin-top": "24px" }}>
        <ZagWaterfall
          items={items()}
          columnCount={columnCount()}
          registerBenchmarkRunner={(next) => {
            runner = next
          }}
        />
        <MetricsDisplay label="@zag-js/virtualizer" metrics={metrics()} />
      </div>
    </main>
  )
}
