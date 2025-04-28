import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

interface Item {
  code: string
  label: string
}
export class Combobox extends Component<combobox.Props, combobox.Api> {
  options: Item[] = comboboxData.slice()

  setOptions(options: Item[]) {
    this.options = options
    this.renderItems()
  }

  getCollection(items: Item[]) {
    return combobox.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    })
  }

  initMachine(props: combobox.Props) {
    const self = this
    return new VanillaMachine(combobox.machine, {
      ...props,
      get collection() {
        return self.getCollection(self.options || comboboxData)
      },
      onOpenChange: () => {
        self.options = comboboxData
      },
      onInputValueChange: ({ inputValue }) => {
        const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
        self.options = filtered.length > 0 ? filtered : comboboxData
      },
    })
  }

  initApi() {
    return combobox.connect(this.machine.service, normalizeProps)
  }

  renderItems = () => {
    const contentEl = this.getOrCreateContentEl()
    while (contentEl?.firstChild) {
      contentEl.removeChild(contentEl.firstChild)
    }
    this.items.forEach((item) => {
      contentEl?.appendChild(item)
    })
  }

  render = () => {
    spreadProps(this.rootEl, this.api.getRootProps())

    const inputEl = this.rootEl?.querySelector<HTMLElement>(".combobox-input")
    if (inputEl) spreadProps(inputEl, this.api.getInputProps())

    const triggerEl = this.rootEl?.querySelector<HTMLElement>(".combobox-trigger")
    if (triggerEl) spreadProps(triggerEl, this.api.getTriggerProps())

    const clearTriggerEl = this.rootEl?.querySelector<HTMLElement>(".combobox-clear-trigger")
    if (clearTriggerEl) spreadProps(clearTriggerEl, this.api.getClearTriggerProps())

    const controlEl = this.rootEl?.querySelector<HTMLElement>(".combobox-control")
    if (controlEl) spreadProps(controlEl, this.api.getControlProps())

    const contentEl = this.getOrCreateContentEl()
    spreadProps(contentEl, this.api.getContentProps())

    // TODO: sync item props instead of re-rendering
    this.renderItems()
  }

  getOrCreateContentEl = () => {
    let contentEl = this.rootEl?.querySelector<HTMLElement>(".combobox-content")
    if (!contentEl) {
      contentEl = this.doc.createElement("div")
      contentEl.classList.add("combobox-content")
      this.rootEl?.appendChild(contentEl)
    }
    return contentEl
  }

  private get items() {
    return Array.from(
      this.options.map((item) => {
        const itemEl = this.doc.createElement("div")
        itemEl.innerText = item.label
        itemEl.classList.add("combobox-item")
        spreadProps(itemEl, this.api.getItemProps({ item }))
        return itemEl
      }),
    )
  }
}
