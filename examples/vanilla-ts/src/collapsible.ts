import * as collapsible from "@zag-js/collapsible"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Collapsible extends Component<collapsible.Props, collapsible.Api> {
  initMachine(props: collapsible.Props) {
    return new VanillaMachine(collapsible.machine, {
      ...props,
    })
  }

  initApi() {
    return collapsible.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".collapsible-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    const indicator = this.rootEl.querySelector<HTMLElement>(".collapsible-indicator")
    if (indicator) this.spreadProps(indicator, this.api.getIndicatorProps())

    const content = this.rootEl.querySelector<HTMLElement>(".collapsible-content")
    if (content) this.spreadProps(content, this.api.getContentProps())

    // Control buttons (query from document since they're outside root)
    const openBtn = this.doc.querySelector<HTMLElement>(".collapsible-open")
    if (openBtn) {
      openBtn.onclick = () => this.api.setOpen(true)
    }

    const closeBtn = this.doc.querySelector<HTMLElement>(".collapsible-close")
    if (closeBtn) {
      closeBtn.onclick = () => this.api.setOpen(false)
    }
  }
}
