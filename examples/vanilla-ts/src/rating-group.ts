import * as rating from "@zag-js/rating-group"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class RatingGroup extends Component<rating.Props, rating.Api> {
  initMachine(props: rating.Props) {
    return new VanillaMachine(rating.machine, {
      ...props,
    })
  }

  initApi() {
    return rating.connect(this.machine.service, normalizeProps)
  }

  private syncItems = () => {
    const control = this.rootEl.querySelector<HTMLElement>(".rating-control")
    if (!control) return

    // Save focused element id before update
    const focusedId = this.doc.activeElement?.id

    const existingItems = Array.from(control.querySelectorAll<HTMLElement>("span"))

    // Remove excess items
    while (existingItems.length > this.api.items.length) {
      const item = existingItems.pop()
      if (item) control.removeChild(item)
    }

    // Update or create items
    this.api.items.forEach((index, i) => {
      let itemEl = existingItems[i]
      const state = this.api.getItemState({ index })

      if (!itemEl) {
        itemEl = this.doc.createElement("span")
        control.appendChild(itemEl)
      }

      // Update star SVG based on state (before spreadProps)
      if (state.half) {
        itemEl.innerHTML = `
          <svg viewBox="0 0 273 260" data-part="star">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z" fill="currentColor"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z" fill="#bdbdbd"/>
          </svg>
        `
      } else {
        itemEl.innerHTML = `
          <svg viewBox="0 0 273 260" data-part="star">
            <path d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z" fill="currentColor"/>
          </svg>
        `
      }

      this.spreadProps(itemEl, this.api.getItemProps({ index }))
    })

    // Restore focus after update
    if (focusedId) {
      const elementToFocus = this.doc.getElementById(focusedId)
      elementToFocus?.focus()
    }
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".rating-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".rating-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".rating-hidden-input")
    if (hiddenInput) this.spreadProps(hiddenInput, this.api.getHiddenInputProps())

    this.syncItems()
  }
}
