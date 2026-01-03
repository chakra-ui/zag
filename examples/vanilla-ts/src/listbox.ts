import * as listbox from "@zag-js/listbox"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

interface Item {
  label: string
  value: string
}

const listboxData: Item[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
]

export type ListboxComponentProps = Omit<listbox.Props, "collection">

export class Listbox extends Component<ListboxComponentProps, listbox.Api> {
  private getCollection() {
    return listbox.collection({
      items: listboxData,
      itemToValue: (item: Item) => item.value,
      itemToString: (item: Item) => item.label,
    })
  }

  initMachine(props: ListboxComponentProps) {
    const self = this
    return new VanillaMachine(listbox.machine, {
      ...props,
      get collection() {
        return self.getCollection()
      },
    })
  }

  initApi() {
    return listbox.connect(this.machine.service, normalizeProps)
  }

  syncItems = () => {
    const content = this.rootEl.querySelector<HTMLElement>(".listbox-content")
    if (!content) return

    const existingItems = Array.from(content.querySelectorAll<HTMLElement>(".listbox-item"))

    // Remove excess items
    while (existingItems.length > listboxData.length) {
      const item = existingItems.pop()
      if (item) content.removeChild(item)
    }

    // Update or create items
    listboxData.forEach((item, index) => {
      let itemEl = existingItems[index]

      if (!itemEl) {
        // Create new item
        itemEl = this.doc.createElement("li")
        itemEl.className = "listbox-item"

        const textEl = this.doc.createElement("span")
        textEl.className = "listbox-item-text"
        itemEl.appendChild(textEl)

        const indicatorEl = this.doc.createElement("span")
        indicatorEl.className = "listbox-item-indicator"
        indicatorEl.textContent = "✓"
        itemEl.appendChild(indicatorEl)

        content.appendChild(itemEl)
      }

      // Always spread props
      spreadProps(itemEl, this.api.getItemProps({ item }))

      const textEl = itemEl.querySelector<HTMLElement>(".listbox-item-text")
      if (textEl) {
        spreadProps(textEl, this.api.getItemTextProps({ item }))
        textEl.textContent = item.label
      }

      const indicatorEl = itemEl.querySelector<HTMLElement>(".listbox-item-indicator")
      if (indicatorEl) {
        spreadProps(indicatorEl, this.api.getItemIndicatorProps({ item }))
      }
    })
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".listbox-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const content = this.rootEl.querySelector<HTMLElement>(".listbox-content")
    if (content) spreadProps(content, this.api.getContentProps())

    // Sync items after all other props are set
    this.syncItems()
  }
}
