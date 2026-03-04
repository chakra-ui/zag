import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Pagination } from "../src/pagination"

// Generate sample data
const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))
}

const data = generateData(100)

document.querySelectorAll<HTMLElement>(".pagination-root").forEach((rootEl) => {
  const paginationComponent = new Pagination(rootEl, {
    id: nanoid(),
    count: data.length,
    pageSize: 10,
    defaultPage: 1,
    siblingCount: 1,
  })

  // Render data list
  const renderDataList = () => {
    const container = rootEl.closest(".pagination")
    const dataList = container?.querySelector<HTMLElement>(".data-list")
    if (!dataList) return

    const slicedData = paginationComponent.api.slice(data)
    dataList.innerHTML = slicedData
      .map(
        (item) => `
      <div class="data-item">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `,
      )
      .join("")
  }

  // Subscribe before init to capture all updates
  paginationComponent.machine.subscribe(() => {
    renderDataList()
  })

  paginationComponent.init()

  // Initial render after init
  renderDataList()
})
