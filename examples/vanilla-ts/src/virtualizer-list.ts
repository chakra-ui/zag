import { ListVirtualizer } from "@zag-js/virtualizer"

const ITEM_COUNT = 10_000

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index + 1}`,
  description: `This is the description for item ${index + 1}`,
}))

const scrollEl = document.querySelector<HTMLDivElement>("#scroll-container")!
const innerEl = document.querySelector<HTMLDivElement>("#inner")!
const smoothToggle = document.querySelector<HTMLInputElement>("#smooth-toggle")!

const virtualizer = new ListVirtualizer({
  count: ITEM_COUNT,
  estimatedSize: () => 64,
  overscan: 6,
})

scrollEl.addEventListener("scroll", virtualizer.handleScroll)

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
      div.innerHTML = `
        <strong>${item.name}</strong>
        <p style="margin: 6px 0 0; color: #64748b">${item.description}</p>
      `
      return div
    }),
  )
}

const unsubscribe = virtualizer.subscribe(render)
virtualizer.init(scrollEl)
render()

document.querySelectorAll<HTMLButtonElement>("button[data-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action
    const smooth = smoothToggle.checked
    if (action === "top") virtualizer.scrollToIndex(0, { smooth })
    else if (action === "middle") virtualizer.scrollToIndex(Math.floor(ITEM_COUNT / 2), { align: "center", smooth })
    else if (action === "bottom") virtualizer.scrollToIndex(ITEM_COUNT - 1, { smooth })
  })
})

window.addEventListener("beforeunload", () => {
  unsubscribe()
  virtualizer.destroy()
})
