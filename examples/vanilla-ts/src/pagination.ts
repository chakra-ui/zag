import * as pagination from "@zag-js/pagination"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class Pagination extends Component<pagination.Props, pagination.Api> {
  initMachine(props: pagination.Props) {
    return new VanillaMachine(pagination.machine, {
      ...props,
    })
  }

  initApi() {
    return pagination.connect(this.machine.service, normalizeProps)
  }

  syncItems = () => {
    const itemsContainer = this.rootEl.querySelector<HTMLElement>(".pagination-items")
    if (!itemsContainer) return

    // Clear existing items
    itemsContainer.innerHTML = ""

    // Create items based on api.pages
    this.api.pages.forEach((page, index) => {
      if (page.type === "ellipsis") {
        const ellipsis = this.doc.createElement("span")
        ellipsis.className = "pagination-ellipsis"
        spreadProps(ellipsis, this.api.getEllipsisProps({ index }))
        ellipsis.textContent = "..."
        itemsContainer.appendChild(ellipsis)
      } else {
        const button = this.doc.createElement("button")
        button.className = "pagination-item"
        spreadProps(button, this.api.getItemProps({ type: "page", value: page.value }))
        button.textContent = String(page.value)
        if (page.value === this.api.page) {
          button.setAttribute("data-selected", "true")
        }
        itemsContainer.appendChild(button)
      }
    })
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const prevButton = this.rootEl.querySelector<HTMLElement>(".pagination-prev-trigger")
    if (prevButton) spreadProps(prevButton, this.api.getPrevTriggerProps())

    const nextButton = this.rootEl.querySelector<HTMLElement>(".pagination-next-trigger")
    if (nextButton) spreadProps(nextButton, this.api.getNextTriggerProps())

    // Update page info
    const pageInfo = this.rootEl.querySelector<HTMLElement>(".pagination-page-info")
    if (pageInfo) {
      pageInfo.textContent = `Page ${this.api.page} of ${this.api.totalPages} (${this.api.pageRange.start}-${this.api.pageRange.end} of ${this.api.count})`
    }

    // Sync items
    this.syncItems()
  }
}
