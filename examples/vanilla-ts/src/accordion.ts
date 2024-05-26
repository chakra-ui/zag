import * as accordion from "@zag-js/accordion"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"

export class Accordion {
  rootEl: HTMLElement
  service: ReturnType<typeof accordion.machine>
  api: accordion.Api<any>

  constructor(rootEl: HTMLElement | null, context: accordion.Context) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl

    this.service = accordion.machine(context)
    this.api = accordion.connect(this.service.state, this.service.send, normalizeProps)
  }

  init = () => {
    const { service } = this
    this.render()
    this.service.subscribe(() => {
      this.api = accordion.connect(service.state, service.send, normalizeProps)
      this.render()
    })
    this.service.start()
  }

  destroy = () => {
    this.service.stop()
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

  render = () => {
    spreadProps(this.rootEl, this.api.rootProps)

    this.items.forEach((itemEl) => {
      this.renderItem(itemEl)
    })
  }
}
