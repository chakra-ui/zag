import * as select from "@zag-js/select"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

interface Item {
  label: string
  value: string
}

const selectData: Item[] = [
  { label: "Canada (CA)", value: "CA" },
  { label: "United States (US)", value: "US" },
  { label: "Japan (JP)", value: "JP" },
  { label: "Nigeria (NG)", value: "NG" },
  { label: "United Kingdom (GB)", value: "GB" },
  { label: "Germany (DE)", value: "DE" },
  { label: "France (FR)", value: "FR" },
]

export class Select extends Component<select.Props, select.Api> {
  private getCollection() {
    return select.collection({
      items: selectData,
      itemToValue: (item: Item) => item.value,
      itemToString: (item: Item) => item.label,
    })
  }

  initMachine(props: select.Props) {
    const self = this
    return new VanillaMachine(select.machine, {
      ...props,
      name: "country",
      get collection() {
        return self.getCollection()
      },
    })
  }

  initApi() {
    return select.connect(this.machine.service, normalizeProps)
  }

  syncItems = () => {
    const content = this.rootEl.querySelector<HTMLElement>(".select-content")
    if (!content) return

    const existingItems = Array.from(content.querySelectorAll<HTMLElement>(".select-item"))

    // Remove excess items
    while (existingItems.length > selectData.length) {
      const item = existingItems.pop()
      if (item) content.removeChild(item)
    }

    // Update or create items
    selectData.forEach((item, index) => {
      let itemEl = existingItems[index]

      if (!itemEl) {
        // Create new item
        itemEl = this.doc.createElement("li")
        itemEl.className = "select-item"

        const textEl = this.doc.createElement("span")
        textEl.className = "select-item-text"
        itemEl.appendChild(textEl)

        const indicatorEl = this.doc.createElement("span")
        indicatorEl.className = "select-item-indicator"
        indicatorEl.textContent = "✓"
        itemEl.appendChild(indicatorEl)

        content.appendChild(itemEl)
      }

      // Always spread props
      spreadProps(itemEl, this.api.getItemProps({ item }))

      const textEl = itemEl.querySelector<HTMLElement>(".select-item-text")
      if (textEl) {
        spreadProps(textEl, this.api.getItemTextProps({ item }))
        textEl.textContent = item.label
      }

      const indicatorEl = itemEl.querySelector<HTMLElement>(".select-item-indicator")
      if (indicatorEl) {
        spreadProps(indicatorEl, this.api.getItemIndicatorProps({ item }))
      }
    })

    // Sync hidden select options
    const hiddenSelect = this.rootEl.querySelector<HTMLSelectElement>(".select-hidden-select")
    if (hiddenSelect) {
      const existingOptions = Array.from(hiddenSelect.querySelectorAll("option"))

      // Remove excess options
      while (existingOptions.length > selectData.length + (this.api.empty ? 1 : 0)) {
        const option = existingOptions.pop()
        if (option) hiddenSelect.removeChild(option)
      }

      // Add empty option if needed
      if (this.api.empty && (!existingOptions[0] || existingOptions[0].value !== "")) {
        const emptyOption = this.doc.createElement("option")
        emptyOption.value = ""
        hiddenSelect.insertBefore(emptyOption, hiddenSelect.firstChild)
      }

      // Update or create options
      selectData.forEach((item, index) => {
        const offset = this.api.empty ? 1 : 0
        let optionEl = existingOptions[index + offset]

        if (!optionEl) {
          optionEl = this.doc.createElement("option")
          hiddenSelect.appendChild(optionEl)
        }

        optionEl.value = item.value
        optionEl.textContent = item.label
      })
    }
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".select-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".select-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".select-trigger")
    if (trigger) spreadProps(trigger, this.api.getTriggerProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".select-value-text")
    if (valueText) {
      valueText.textContent = this.api.valueAsString || "Select option"
    }

    const indicator = this.rootEl.querySelector<HTMLElement>(".select-indicator")
    if (indicator) spreadProps(indicator, this.api.getIndicatorProps())

    const clearBtn = this.rootEl.querySelector<HTMLElement>(".select-clear")
    if (clearBtn) spreadProps(clearBtn, this.api.getClearTriggerProps())

    const hiddenSelect = this.rootEl.querySelector<HTMLSelectElement>(".select-hidden-select")
    if (hiddenSelect) spreadProps(hiddenSelect, this.api.getHiddenSelectProps())

    const positioner = this.rootEl.querySelector<HTMLElement>(".select-positioner")
    if (positioner) spreadProps(positioner, this.api.getPositionerProps())

    const content = this.rootEl.querySelector<HTMLElement>(".select-content")
    if (content) spreadProps(content, this.api.getContentProps())

    // Sync items after all other props are set
    this.syncItems()
  }
}
