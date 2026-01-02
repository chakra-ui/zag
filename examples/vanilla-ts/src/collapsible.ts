import * as collapsible from "@zag-js/collapsible"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

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
    spreadProps(this.rootEl, this.api.getRootProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".collapsible-trigger")
    if (trigger) spreadProps(trigger, this.api.getTriggerProps())

    const indicator = this.rootEl.querySelector<HTMLElement>(".collapsible-indicator")
    if (indicator) spreadProps(indicator, this.api.getIndicatorProps())

    const content = this.rootEl.querySelector<HTMLElement>(".collapsible-content")
    if (content) spreadProps(content, this.api.getContentProps())

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
