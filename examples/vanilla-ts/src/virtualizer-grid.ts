import { GridVirtualizer } from "@zag-js/virtualizer"

const ROW_COUNT = 1_000
const COLUMN_COUNT = 50
const CELL_HEIGHT = 40
const CELL_WIDTH = 120

const scrollEl = document.querySelector<HTMLDivElement>("#scroll-container")!
const innerEl = document.querySelector<HTMLDivElement>("#inner")!

const virtualizer = new GridVirtualizer({
  rowCount: ROW_COUNT,
  columnCount: COLUMN_COUNT,
  estimatedRowSize: () => CELL_HEIGHT,
  estimatedColumnSize: () => CELL_WIDTH,
  overscan: 3,
  observeScrollElementSize: true,
})

scrollEl.addEventListener("scroll", virtualizer.handleScroll)

function render() {
  innerEl.style.height = `${virtualizer.getTotalHeight()}px`
  innerEl.style.width = `${virtualizer.getTotalWidth()}px`

  innerEl.replaceChildren(
    ...virtualizer.getVirtualRows().map((row) => {
      const rowEl = document.createElement("div")
      rowEl.style.cssText = `position: absolute; top: ${row.y}px; left: 0; height: ${row.height}px; width: ${virtualizer.getTotalWidth()}px;`

      for (const column of row.columns) {
        const cell = document.createElement("div")
        cell.style.cssText = `
          position: absolute;
          top: 0;
          left: ${column.x}px;
          width: ${column.width}px;
          height: ${row.height}px;
          border: 1px solid #e5e7eb;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          background: ${(row.row + column.column) % 2 === 0 ? "#fff" : "#f8fafc"};
        `
        cell.textContent = `R${row.row + 1}C${column.column + 1}`
        rowEl.appendChild(cell)
      }
      return rowEl
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
