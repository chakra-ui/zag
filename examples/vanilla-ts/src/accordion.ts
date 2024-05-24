import * as accordion from "@zag-js/accordion"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"

export class Accordion {
  rootEl: HTMLElement
  service: ReturnType<typeof accordion.machine>
  api: accordion.Api<any>

  constructor(root: string, context: accordion.Context) {
    const rootEl = document.querySelector<HTMLElement>(root)

    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl

    this.service = accordion.machine(context)
    this.api = accordion.connect(this.service.state, this.service.send, normalizeProps)
  }

  private disposable = new Map<HTMLElement, VoidFunction>()

  init = () => {
    const { service } = this
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

  private renderRoot = () => {
    const rootEl = this.rootEl
    this.disposable.set(rootEl, spreadProps(this.rootEl, this.api.rootProps))
  }

  private renderItem = (itemEl: HTMLElement) => {
    const value = itemEl.dataset.value
    if (!value) throw new Error("Expected value to be defined")

    const itemTriggerEl = itemEl.querySelector<HTMLButtonElement>(".accordion-trigger")
    const itemContentEl = itemEl.querySelector<HTMLElement>(".accordion-content")

    if (!itemTriggerEl) throw new Error("Expected triggerEl to be defined")
    if (!itemContentEl) throw new Error("Expected contentEl to be defined")

    const cleanup = this.disposable.get(itemEl)
    cleanup?.()

    const cleanups = [
      spreadProps(itemEl, this.api.getItemProps({ value })),
      spreadProps(itemTriggerEl, this.api.getItemTriggerProps({ value })),
      spreadProps(itemContentEl, this.api.getItemContentProps({ value })),
    ]

    this.disposable.set(itemEl, () => {
      cleanups.forEach((fn) => fn())
    })
  }

  render = () => {
    this.renderRoot()
    this.items.forEach((itemEl) => {
      this.renderItem(itemEl)
    })
  }
}
