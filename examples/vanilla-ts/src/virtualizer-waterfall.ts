import { WaterfallVirtualizer } from "@zag-js/virtualizer"

const ITEM_COUNT = 1_000

function getItemHeight(index: number) {
  const hash = ((index * 1103515245 + 12345) >>> 0) % 170
  return 120 + hash
}

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  title: `Card ${index + 1}`,
  subtitle: `Score ${(index * 37) % 100}`,
  height: getItemHeight(index),
}))

const scrollEl = document.querySelector<HTMLDivElement>("#scroll-container")!
const innerEl = document.querySelector<HTMLDivElement>("#inner")!
const summaryEl = document.querySelector<HTMLParagraphElement>("#summary")!

const virtualizer = new WaterfallVirtualizer({
  count: ITEM_COUNT,
  columnCount: 3,
  columnGap: 12,
  rowGap: 12,
  overscan: 6,
  estimatedSize: (index) => getItemHeight(index),
})

scrollEl.addEventListener("scroll", virtualizer.handleScroll)

function render() {
  const layout = virtualizer.getWaterfallState()
  innerEl.style.height = `${virtualizer.getTotalSize()}px`
  summaryEl.textContent = `Masonry layout with ${ITEM_COUNT.toLocaleString()} variable-height cards across ${layout.columnCount} columns.`

  innerEl.replaceChildren(
    ...virtualizer.getVirtualItems().map((vi) => {
      const item = items[vi.index]
      const lane = vi.lane ?? 0
      const left = layout.columns[lane]?.offset ?? 0
      const div = document.createElement("div")
      div.dataset.index = String(vi.index)
      div.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        transform: translate3d(${left}px, ${vi.start}px, 0);
        width: ${layout.columnWidth}px;
        height: ${item.height}px;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        box-sizing: border-box;
        background: linear-gradient(180deg, rgba(241,245,249,0.7) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%);
      `
      div.innerHTML = `
        <strong style="font-size: 13px">${item.title}</strong>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b">${item.subtitle} · ${item.height}px</p>
      `
      return div
    }),
  )
}

const unsubscribe = virtualizer.subscribe(render)
virtualizer.init(scrollEl)
render()

window.addEventListener("beforeunload", () => {
  unsubscribe()
  virtualizer.destroy()
})
