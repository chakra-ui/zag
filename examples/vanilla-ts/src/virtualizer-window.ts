import { WindowVirtualizer } from "@zag-js/virtualizer"

const ITEM_COUNT = 10_000

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
}))

const rootEl = document.querySelector<HTMLDivElement>("#root")!
const innerEl = document.querySelector<HTMLDivElement>("#inner")!

const virtualizer = new WindowVirtualizer({
  count: ITEM_COUNT,
  estimatedSize: () => 72,
  overscan: 8,
  initialRect: { width: window.innerWidth, height: window.innerHeight },
})

function render() {
  innerEl.style.height = `${virtualizer.getTotalSize()}px`

  innerEl.replaceChildren(
    ...virtualizer.getVirtualItems().map((vi) => {
      const item = items[vi.index]
      const div = document.createElement("div")
      div.dataset.index = String(vi.index)
      div.style.cssText = `
        position: absolute;
        left: 0;
        width: 100%;
        height: ${vi.size}px;
        transform: translateY(${vi.start}px);
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        background: ${vi.index % 2 === 0 ? "#f8fafc" : "#fff"};
        box-sizing: border-box;
      `
      div.textContent = item.name
      return div
    }),
  )
}

const unsubscribe = virtualizer.subscribe(render)
virtualizer.init(rootEl)
render()

window.addEventListener("beforeunload", () => {
  unsubscribe()
  virtualizer.destroy()
})
