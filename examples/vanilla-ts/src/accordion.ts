import * as accordion from "@zag-js/accordion"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"
import { Component } from "./component"

export class Accordion extends Component<accordion.Props, accordion.Api> {
  initMachine(props: accordion.Props) {
    return new VanillaMachine(accordion.machine, props)
  }

  initApi() {
    return accordion.connect(this.machine.service, normalizeProps)
  }

  render = () => {
    spreadProps(this.rootEl, this.api.getRootProps())
    this.items.forEach((itemEl) => {
      this.renderItem(itemEl)
    })
  }

  private get items() {
    return Array.from(this.rootEl!.querySelectorAll<HTMLElement>(".accordion-item"))
  }

  private renderItem = (itemEl: HTMLElement) => {
    const value = itemEl.dataset.value
    if (!value) throw new Error("Expected value to be defined")
    const itemTriggerEl = itemEl.querySelector<HTMLButtonElement>(".accordion-trigger")
    const itemContentEl = itemEl.querySelector<HTMLElement>(".accordion-content")
    if (!itemTriggerEl) throw new Error("Expected triggerEl to be defined")
    if (!itemContentEl) throw new Error("Expected contentEl to be defined")
    spreadProps(itemEl, this.api.getItemProps({ value }))
    spreadProps(itemTriggerEl, this.api.getItemTriggerProps({ value }))
    spreadProps(itemContentEl, this.api.getItemContentProps({ value }))
  }
}
